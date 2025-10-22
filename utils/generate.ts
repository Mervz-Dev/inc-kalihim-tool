import { Percent } from "@/types/percent";
import { User } from "@/types/user";

export const generateSessionHtml = (data: User.SessionData[]) => {
  const chunkSize = 3;
  const chunkedData: User.SessionData[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunkedData.push(data.slice(i, i + chunkSize));
  }

  const html = `
    <html>
      <head>
        <style>
          @media print {
            .page {
              page-break-after: always;
              break-after: page;
              padding-top: 24px;
            }
          }

          body {
            font-family: Arial, sans-serif;
            padding: 12px;
            margin: 0;
          }

          .page {
            display: block;
            padding-top: 24px;
          }

          .groups-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0;
            width: 100%;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            border: 1px solid #ddd;
            table-layout: fixed;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            height: 32px;
            vertical-align: middle;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          th {
            background-color: #f3f4f6;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
          }

          .number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #000;
            color: #fff;
            font-size: 10px;
            font-weight: bold;
            margin-right: 6px;
            flex-shrink: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .fullname {
            font-size: 14px;
          }

          .fullname.long-name {
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        ${chunkedData
          .map(
            (groupSet) => `
            <div class="page">
              <div class="groups-row">
                ${groupSet
                  .map((group) => {
                    const firstMale = group.firstSession.maleUsers;
                    const firstFemale = group.firstSession.femaleUsers;

                    const secondMale = group.secondSession.maleUsers;
                    const secondFemale = group.secondSession.femaleUsers;

                    const renderRows = (
                      maleUsers: User.User[],
                      femaleUsers: User.User[],
                      totalRows: number
                    ) => {
                      const rows: string[] = [];

                      // Male Users
                      let index = 1;
                      maleUsers.forEach((u) => {
                        const nameClass =
                          u.fullname.length > 25
                            ? "fullname long-name"
                            : "fullname";
                        rows.push(
                          `<tr>
                            <td colspan="2"><span class="number">${index++}</span><span class="${nameClass}">${
                            u.fullname
                          }</span></td>
                          </tr>`
                        );
                      });

                      // Add empty row for separation before female users
                      if (femaleUsers.length > 0) {
                        rows.push(`<tr><td colspan="2"></td></tr>`);
                      }

                      // Female Users (restart numbering)
                      index = 1;
                      femaleUsers.forEach((u) => {
                        const nameClass =
                          u.fullname.length > 25
                            ? "fullname long-name"
                            : "fullname";
                        rows.push(
                          `<tr>
                            <td colspan="2"><span class="number">${index++}</span><span class="${nameClass}">${
                            u.fullname
                          }</span></td>
                          </tr>`
                        );
                      });

                      while (rows.length < totalRows) {
                        rows.push(`<tr><td colspan="2"></td></tr>`);
                      }

                      return rows.join("");
                    };

                    return `
                      <table>
                        <tr><th colspan="2">${group.purok} - ${
                      group.grupo
                    } (Wed/Thu)</th></tr>
                        ${renderRows(firstMale, firstFemale, 12)}

                        <tr><th colspan="2">${group.purok} - ${
                      group.grupo
                    } (Sat/Sun)</th></tr>
                        ${renderRows(secondMale, secondFemale, 12)}
                      </table>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `
          )
          .join("")}
      </body>
    </html>
  `;

  return html;
};

export const generateDefaultPercentData = (
  groupCount: number
): Percent.Percent => {
  const groupValues: Percent.GroupValues[] = Array.from(
    { length: groupCount },
    (_, i) => {
      const emptySession: Percent.Session = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        g: 0,
        h: 0,
        i: 0,
        j: 0,
        k: 0,
        l: 0,
        m: 0,
        n: 0,
        r107: 0,
        totalDalaw: 0,
        totalCoded: 0,
      };

      const base: Percent.GroupValues = {
        group: i + 1,
        in: 0,
        out: 0,
        firstSession: { ...emptySession },
        secondSession: { ...emptySession },
      };

      return base;
    }
  );

  const sNumber: Percent.SNumber[] = Array.from(
    { length: groupCount },
    (_, i) => ({
      group: i + 1,
      count: 0,
    })
  );

  return { groupValues, sNumber };
};
