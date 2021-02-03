export const columnBody = (selector: string): string => `
${selector} {
    height: calc(100vh - 170px);
    overflow-y: scroll;
}`;

export const columnHeading = (selector: string): string => `
${selector} {
    display: block;
    text-align: center;
    padding: 15px;
    font-size: 16pt;
}`;

export const columnTable = (selector?: string): string => `
${selector ?? 'table'} {
    width: 100%;
    border-collapse: collapse;
}`;

export const tableHeading = (selector?: string): string => `
${selector ?? 'th'} {
    background-color: var(--bg-light);
    padding: 10px;
    font-weight: normal;
    text-align: left;
    border: 1px solid #000000;
}`;

export const tableData = (selector?: string): string => `
${selector ?? 'td'} {
    padding: 10px;
    border: 1px solid #000000;
}`;

export const columnFooter = (selector: string): string => `
${selector} {
    border-top: 1px solid black;
}`;

export const columnFooterCost = (selector: string): string => `
${selector} {
    display: block;
    float: right;
    margin: 22px 30px;
    color: var(--secundary-color);
    font-weight: 700;
    font-size: larger;
}`;
