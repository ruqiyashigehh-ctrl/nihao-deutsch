import ExcelJS from 'exceljs';

export interface XlsxParseOptions {
  sheetName?: string;
  expectedColumns?: string[];
  skipSheets?: string[];
}

export async function parseXlsx<T = Record<string, any>>(
  buffer: Buffer,
  options: XlsxParseOptions = {},
): Promise<T[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const targetSheet = options.sheetName
    ? workbook.getWorksheet(options.sheetName)
    : workbook.worksheets[0];

  if (!targetSheet) {
    throw new Error(
      `工作表"${options.sheetName ?? 'Sheet1'}"不存在，可用工作表: ${workbook.worksheets.map((s) => s.name).join(', ')}`,
    );
  }

  const rows: T[] = [];
  let headers: string[] = [];

  targetSheet.eachRow((row, rowNum) => {
    const values = row.values as any[];
    if (rowNum === 1) {
      headers = values.slice(1).map((v) => (v != null ? String(v).trim() : ''));
      if (options.expectedColumns) {
        const missing = options.expectedColumns.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          throw new Error(`缺少必要列: ${missing.join(', ')}，实际列: ${headers.join(', ')}`);
        }
      }
      return;
    }

    const obj: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      if (!key) continue;
      const val = values[i + 1];
      obj[key] = val != null ? val : null;
    }
    if (Object.values(obj).some((v) => v != null && v !== '')) {
      rows.push(obj as T);
    }
  });

  return rows;
}