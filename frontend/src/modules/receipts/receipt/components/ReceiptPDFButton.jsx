import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReceiptPDFButton = ({ receipt, className = "btn btn-sm btn-outline-primary" }) => {
    
    const handleDownload = (e) => {
        e.stopPropagation();

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            
            // 1. ENCABEZADO (Espacio para logo a la izquierda)
            // Si tienes el logo: doc.addImage(base64, 'PNG', 14, 15, 25, 25);
            
            doc.setFontSize(20);
            doc.setTextColor(33, 37, 41); // Color original (oscuro)
            doc.text("RECIBO DE PAGO", 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`No. Recibo: ${receipt.receipt_number}`, 14, 28);
            doc.text(`Fecha: ${new Date(receipt.issued_at).toLocaleString()}`, 14, 33);

            // 2. INFORMACIÓN DEL CLIENTE Y PAGO
            doc.setTextColor(33, 37, 41);
            doc.setDrawColor(200);
            doc.line(14, 38, pageWidth - 14, 38); 

            // Cliente
            doc.setFont(undefined, 'bold');
            doc.text("CLIENTE:", 14, 46);
            doc.setFont(undefined, 'normal');
            doc.text(receipt.customer?.name ?? 'Consumidor Final', 35, 46);
            doc.text(`Correo: ${receipt.customer?.email ?? '—'}`, 35, 51);

            // Método de Pago (Alineado a la derecha o columna 2)
            doc.setFont(undefined, 'bold');
            doc.text("MÉTODO DE PAGO:", 120, 46);
            doc.setFont(undefined, 'normal');
            doc.text(receipt.payment_method_name ?? '—', 155, 46);

            // 3. TABLA DE ITEMS (Autoajustable)
            autoTable(doc, {
                startY: 60,
                head: [['SKU', 'Descripción', 'Cant.', 'UoM', 'Precio Unit.', 'Total']],
                body: (receipt.items || []).map(item => [
                    item.variant_sku,
                    item.variant_name ?? 'Producto',
                    item.quantity,
                    item.selected_uom_name,
                    `Q ${Number(item.unit_price).toFixed(2)}`,
                    `Q ${Number(item.line_total).toFixed(2)}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [33, 37, 41] }, // Color original (negro/gris)
                styles: { fontSize: 9 },
                columnStyles: {
                    5: { halign: 'right' }
                }
            });

            // 4. SECCIÓN DE TOTALES (Con más espacio para evitar sobreposición)
            // Usamos un incremento constante (step) para el espaciado vertical
            let currentY = doc.lastAutoTable.finalY + 12; 
            const rightColumnX = pageWidth - 14;
            const labelX = pageWidth - 55;

            doc.setFontSize(10);
            doc.setTextColor(100);
            
            // Subtotal
            doc.text("Subtotal:", labelX, currentY);
            doc.text(`Q ${Number(receipt.subtotal ?? 0).toFixed(2)}`, rightColumnX, currentY, { align: 'right' });
            
            // Envío
            currentY += 7; // Espacio entre líneas
            doc.text("Envío:", labelX, currentY);
            doc.text(`Q ${Number(receipt.shipping_total ?? 0).toFixed(2)}`, rightColumnX, currentY, { align: 'right' });

            // Descuento
            if (Number(receipt.discount_total) > 0) {
                currentY += 7;
                doc.text("Descuento:", labelX, currentY);
                doc.text(`- Q ${Number(receipt.discount_total).toFixed(2)}`, rightColumnX, currentY, { align: 'right' });
            }

            // Espacio extra antes del Gran Total
            currentY += 10; 
            doc.setDrawColor(33, 37, 41);
            doc.setLineWidth(0.5);
            doc.line(labelX, currentY - 5, rightColumnX, currentY - 5); // Línea sobre el total

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.text("TOTAL:", labelX, currentY);
            doc.text(`Q ${Number(receipt.grand_total).toFixed(2)}`, rightColumnX, currentY, { align: 'right' });

            // Descarga
            doc.save(`Recibo_${receipt.receipt_number}.pdf`);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
        }
    };

    return (
        <button 
            type="button" 
            className={className} 
            onClick={handleDownload}
        >
            <FiDownload className="me-1" /> PDF
        </button>
    );
};

export default ReceiptPDFButton;