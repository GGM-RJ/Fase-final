import { StockItem, TransferLog } from '../types';

export const generatePrintableHtml = (title: string, content: string) => {
    return `
        <html>
            <head>
                <title>Relatório - ${title}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f7f7f7; font-weight: 600; }
                    h1 { text-align: center; font-size: 24px; margin-bottom: 10px; color: #333; }
                    h2 { font-size: 18px; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
                    .summary { margin-top: 20px; padding: 15px; background-color: #f7f7f7; border: 1px solid #eee; font-size: 14px; }
                </style>
            </head>
            <body>
                <h1>Relatório - ${title}</h1>
                ${content}
            </body>
        </html>
    `;
};

export const handlePrint = (title: string, content: string) => {
    const htmlContent = generatePrintableHtml(title, content);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
};
