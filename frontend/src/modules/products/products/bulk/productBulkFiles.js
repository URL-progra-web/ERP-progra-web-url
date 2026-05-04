import * as XLSX from 'xlsx';
import { BULK_TEMPLATE_COLUMNS, TEMPLATE_ROWS, createEmptyBulkRow } from './productBulkConfig';

const COLUMN_ALIASES = {
    category: ['Categoria'],
};

const escapeCsvValue = (value) => {
    const text = String(value ?? '');
    const sanitizedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    if (!/[",\n\r]/.test(sanitizedText)) return sanitizedText;
    return `"${sanitizedText.replace(/"/g, '""')}"`;
};

const parseCsv = (text) => {
    const rows = [];
    let field = '';
    let row = [];
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"' && quoted && next === '"') {
            field += '"';
            index += 1;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === ',' && !quoted) {
            row.push(field);
            field = '';
        } else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && next === '\n') index += 1;
            row.push(field);
            if (row.some((value) => value.trim())) rows.push(row);
            row = [];
            field = '';
        } else {
            field += char;
        }
    }

    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
    return rows;
};

const mapRowsFromObjects = (objects) => objects.map((item, index) => {
    const row = createEmptyBulkRow(index);
    BULK_TEMPLATE_COLUMNS.forEach((column) => {
        const aliases = COLUMN_ALIASES[column.key] || [];
        row[column.key] = item[column.header] ?? aliases.map((alias) => item[alias]).find((value) => value !== undefined) ?? item[column.key] ?? '';
    });
    return row;
});

export const exportTemplateCsv = () => {
    const headers = BULK_TEMPLATE_COLUMNS.map((column) => column.header);
    const lines = [
        headers.map(escapeCsvValue).join(','),
        ...TEMPLATE_ROWS.map((row) => BULK_TEMPLATE_COLUMNS
            .map((column) => escapeCsvValue(row[column.key]))
            .join(',')),
    ];
    downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), 'plantilla-productos.csv');
};

export const exportTemplateXlsx = () => {
    const rows = TEMPLATE_ROWS.map((row) => (
        Object.fromEntries(BULK_TEMPLATE_COLUMNS.map((column) => [column.header, row[column.key] || '']))
    ));
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: BULK_TEMPLATE_COLUMNS.map((column) => column.header) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    XLSX.writeFile(workbook, 'plantilla-productos.xlsx');
};

export const exportRowsCsv = (rows) => {
    const headers = BULK_TEMPLATE_COLUMNS.map((column) => column.header);
    const lines = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map((row) => BULK_TEMPLATE_COLUMNS
            .map((column) => escapeCsvValue(row[column.key]))
            .join(',')),
    ];
    downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), 'productos-bulk.csv');
};

export const exportRowsXlsx = (rows) => {
    const data = rows.map((row) => (
        Object.fromEntries(BULK_TEMPLATE_COLUMNS.map((column) => [column.header, row[column.key] || '']))
    ));
    const worksheet = XLSX.utils.json_to_sheet(data, { header: BULK_TEMPLATE_COLUMNS.map((column) => column.header) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    XLSX.writeFile(workbook, 'productos-bulk.xlsx');
};

export const readBulkFile = (file) => new Promise((resolve, reject) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));

    if (extension === 'csv') {
        reader.onload = () => {
            const parsedRows = parseCsv(String(reader.result || ''));
            const [headers, ...rows] = parsedRows;
            const objects = rows.map((row) => Object.fromEntries(
                headers.map((header, index) => [header, row[index] || ''])
            ));
            resolve(mapRowsFromObjects(objects));
        };
        reader.readAsText(file, 'utf-8');
        return;
    }

    reader.onload = () => {
        const workbook = XLSX.read(reader.result, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const objects = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(mapRowsFromObjects(objects));
    };
    reader.readAsArrayBuffer(file);
});

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}
