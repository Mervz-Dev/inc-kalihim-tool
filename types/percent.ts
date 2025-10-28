export declare namespace Percent {
  type SessionKey = "firstSession" | "secondSession";

  interface Codes {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    g: number;
    h: number;
    i: number;
    j: number;
    k: number;
    l: number;
    m: number;
    n: number;
    r107: number;
  }

  interface Session extends Codes {
    in: number;
    out: number;
    r107: number;
    totalDalaw: number;
    totalCoded: number;
    percent?: number;
  }

  interface GroupValues {
    group: number;
    firstSession: Session;
    secondSession: Session;
  }

  interface SNumber {
    group: number;
    count: number;
  }

  interface InfoDetails {
    purok: string;

    week: string;
    month: string;
    year: string;
    dateString: string;
    distrito?: string;
    lokal?: string;
    lokalCode?: string;
    distritoCode?: string;
  }

  interface Percent {
    groupValues: GroupValues[];
    sNumber: SNumber[];
    info?: InfoDetails;
  }

  interface ComputedPercent extends Percent {
    overAllPercentage: number;
    newSNumber: SNumber[];
    firstSessionCodeTotal: Session;
    secondSessionCodeTotal: Session;
  }
}
