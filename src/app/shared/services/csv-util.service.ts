import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CsvUtilService {
  // Converts an array of objects to a CSV string
  arrayToCsv<T extends object>(data: T[], columns?: (keyof T)[]): string {
    if (!data.length) return '';
    const keys = columns || (Object.keys(data[0]) as (keyof T)[]);
    const header = keys.join(',');
    const rows = data.map(row =>
      keys.map(key => '"' + String((row[key] ?? '')).replace(/"/g, '""') + '"').join(',')
    );
    return [header, ...rows].join('\r\n');
  }

  // Parses a CSV string to an array of objects (assumes first row is header)
  csvToArray<T = any>(csv: string): T[] {
    const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, ''));
    return lines.map(line => {
      const values = line.match(/("[^"]*("{2})*[^"]*"|[^,]*)/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = values[i]));
      return obj as T;
    });
  }

  // Triggers a download of a CSV file
  downloadCsv(csv: string, filename: string = 'data.csv') {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Reads a CSV file and returns a Promise with its text content
  readCsvFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
} 