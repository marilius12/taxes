import { useState } from "preact/hooks";
import type { HTMLAttributes } from "preact/compat";

enum Countries {
  Bulgaria = "Bulgaria",
  Italy = "Italy",
  Romania = "Romania",
}

const structures = {
  Bulgaria: ["Corporation", "Freelancer"],
  Italy: ["Inpatriate Regime"],
  Romania: ["Micro-enterprise"],
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0, // no cents
  maximumFractionDigits: 0, // no cents
});

const min10k = 10_000; // the math doesn't work below the minimum wage

const Calculator = () => {
  const [country, setCountry] = useState(Countries.Bulgaria);
  const [structure, setStructure] = useState(structures[country][0]);
  const [grossIncome, setGrossIncome] = useState(100_000);

  const grossIncomeMin10k = Math.max(grossIncome, min10k);

  return (
    <>
      <h1>Example calculations</h1>

      <form>
        <select
          class="margin-right-1"
          value={country}
          onChange={(e) => {
            const country = e.currentTarget.value as Countries;
            setCountry(country);
            setStructure(structures[country][0]);
          }}
        >
          <option value="Bulgaria">Bulgaria 🇧🇬</option>
          <option value="Italy">Italy 🇮🇹</option>
          <option value="Romania">Romania 🇷🇴</option>
        </select>

        <select
          class="margin-right-1"
          value={structure}
          onChange={(e) => setStructure(e.currentTarget.value)}
        >
          {structures[country].map((structure) => (
            <option>{structure}</option>
          ))}
        </select>

        <input
          class="margin-right-1"
          value={usd.format(grossIncome)}
          onInput={(e) => {
            const integer = +e.currentTarget.value.replace(/\D/g, "");
            e.currentTarget.value = usd.format(integer); // https://github.com/preactjs/preact/issues/1899
            setGrossIncome(integer);

            // Weird gotcha: with native attributes like minlength, checkValidity() always returns true
            // if the value is set with JavaScript (like above) https://stackoverflow.com/a/66896481
            e.currentTarget.setCustomValidity(
              integer < min10k
                ? `Please enter ${usd.format(min10k)} or more.`
                : ""
            );
            if (integer < min10k) {
              e.currentTarget.reportValidity();
            }
          }}
          size={7} // https://stackoverflow.com/a/29990524
        />
      </form>

      {country === Countries.Bulgaria ? (
        structure === "Freelancer" ? (
          <FreelancerInBulgaria grossYearlyIncomeUSD={grossIncomeMin10k} />
        ) : (
          <CorporationInBulgaria grossYearlyIncomeUSD={grossIncomeMin10k} />
        )
      ) : country === Countries.Italy ? (
        <InpatriateRegimeInItaly grossYearlyIncomeUSD={grossIncomeMin10k} />
      ) : (
        <MicroEnterpriseInRomania grossYearlyIncomeUSD={grossIncomeMin10k} />
      )}

      <details>
        <summary>Further considerations</summary>
        <p>
          Note that the math doesn't account for business expenses, legal fees
          (ex: consultation, company formation), accounting fees (ex: tax
          remittance, tax returns, etc.), private health insurance, visa fees,
          etc. Taxes on passive income like capital gains and dividends also
          need to be considered.
        </p>
      </details>
    </>
  );
};

export { Calculator };

const USD_EUR = 0.89121;
const EUR_RON = 4.93701;
const EUR_BGN = 1.95583; // fixed

const nf = new Intl.NumberFormat("en-US", {
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmt = (v: number) => nf.format(v).replace(/\D00$/, ""); // https://stackoverflow.com/a/49724581

interface CommonProps {
  grossYearlyIncomeUSD: number;
}

/////////////////////////////////////
//////////// BULGARIA 🇧🇬 ////////////
/////////////////////////////////////

// https://taxsummaries.pwc.com/bulgaria/individual/other-taxes
const MIN_MONTHLY_INSURANCE_BASE_BGN = 710; // 2023
const MAX_MONTHLY_INSURANCE_BASE_BGN = 3_400; // 2023

const BG_SOCIAL_CONTRIBUTION_TAX = 14.8 + 5;
const BG_HEALTH_CONTRIBUTION_TAX = 8;
const BG_RECOGNIZED_COSTS = 25;
const BG_INCOME_TAX = 10;
const BG_DIVIDEND_TAX = 5;

interface BulgariaProps extends CommonProps {
  isEUCitizenOrBulgarianPR?: boolean;
}

const FreelancerInBulgaria = ({
  grossYearlyIncomeUSD,
  isEUCitizenOrBulgarianPR = true,
}: BulgariaProps) => {
  const grossIncome = grossYearlyIncomeUSD * USD_EUR * EUR_BGN;

  const yearlyBase = insuranceBase(
    MIN_MONTHLY_INSURANCE_BASE_BGN * 12,
    grossIncome,
    MAX_MONTHLY_INSURANCE_BASE_BGN * 12
  );
  const socialContrib = yearlyBase * (BG_SOCIAL_CONTRIBUTION_TAX / 100);
  const healthContrib = yearlyBase * (BG_HEALTH_CONTRIBUTION_TAX / 100);
  let socials = socialContrib;
  if (isEUCitizenOrBulgarianPR) socials += healthContrib;

  const recognizedCosts = grossIncome * (BG_RECOGNIZED_COSTS / 100);
  const taxableIncome = grossIncome - socials - recognizedCosts;

  const incomeTax = taxableIncome * (BG_INCOME_TAX / 100);
  const totalTax = incomeTax + socials;
  const netIncome = grossIncome - totalTax;

  const effectiveTax = (totalTax / grossIncome) * 100;

  return (
    <>
      <table>
        <tr>
          <td>FX rate</td>
          <td>USD 1 = BGN {(USD_EUR * EUR_BGN).toFixed(5)}</td>
        </tr>
        <tr>
          <td>Gross income</td>
          <td>BGN {fmt(grossIncome)}</td>
        </tr>
        <tr>
          <td>Social contributions*</td>
          <td>
            {fmt(yearlyBase)} * {BG_SOCIAL_CONTRIBUTION_TAX}% = BGN{" "}
            {fmt(socialContrib)}
          </td>
        </tr>
        {isEUCitizenOrBulgarianPR && (
          <>
            <tr>
              <td>Health contributions**</td>
              <td>
                {fmt(yearlyBase)} * {BG_HEALTH_CONTRIBUTION_TAX}% = BGN{" "}
                {fmt(healthContrib)}
              </td>
            </tr>
            <tr>
              <td>Total socials</td>
              <td>
                {fmt(socialContrib)} + {fmt(healthContrib)} = BGN {fmt(socials)}
              </td>
            </tr>
          </>
        )}
        <tr>
          <td>Recognized costs</td>
          <td>
            {fmt(grossIncome)} * {BG_RECOGNIZED_COSTS}% = BGN{" "}
            {fmt(recognizedCosts)}
          </td>
        </tr>
        <tr>
          <td>Taxable income</td>
          <td>
            {fmt(grossIncome)} - {fmt(socials)} - {fmt(recognizedCosts)} = BGN{" "}
            {fmt(taxableIncome)}
          </td>
        </tr>
        <tr>
          <td>Income tax</td>
          <td>
            {fmt(taxableIncome)} * {BG_INCOME_TAX}% = BGN {fmt(incomeTax)}
          </td>
        </tr>
        <tr>
          <td>Total tax</td>
          <td>
            {fmt(socials)} + {fmt(incomeTax)} = BGN {fmt(totalTax)}
          </td>
        </tr>
        <tr>
          <td>Net income</td>
          <td>
            {fmt(grossIncome)} - {fmt(totalTax)} = BGN {fmt(netIncome)}
          </td>
        </tr>
        <tr>
          <td>Effective tax</td>
          <td>
            {fmt(totalTax)} / {fmt(grossIncome)} ={" "}
            <strong>{effectiveTax.toFixed(2)}%</strong>
          </td>
        </tr>
      </table>

      <p>
        * The insurance base ranges from BGN{" "}
        {fmt(MIN_MONTHLY_INSURANCE_BASE_BGN)} to BGN{" "}
        {fmt(MAX_MONTHLY_INSURANCE_BASE_BGN)} per month (
        <ExternalLink href="https://taxsummaries.pwc.com/bulgaria/individual/other-taxes">
          2023
        </ExternalLink>
        ).
        <br />
        ** The health insurance is only payable by EU citizens or Bulgarian
        permanent residents.
      </p>

      <p>
        Based in part on{" "}
        <ExternalLink href="https://youtu.be/NV3heKehLCw">
          this video
        </ExternalLink>
        . See{" "}
        <ExternalLink href="https://dmitryfrank.com/articles/bulgaria_freelance_taxes">
          this article
        </ExternalLink>{" "}
        for a comprehensive breakdown.
      </p>
    </>
  );
};

function insuranceBase(min: number, income: number, max: number) {
  if (income < min) return min;
  if (income > max) return max;
  return income;
}

const CorporationInBulgaria = ({
  grossYearlyIncomeUSD,
  isEUCitizenOrBulgarianPR = true,
}: BulgariaProps) => {
  const grossIncome = grossYearlyIncomeUSD * USD_EUR * EUR_BGN;

  // Corporate
  const yearlyBase = MIN_MONTHLY_INSURANCE_BASE_BGN * 12;
  const socialSec = yearlyBase * (BG_SOCIAL_CONTRIBUTION_TAX / 100);
  const healthIns = yearlyBase * (BG_HEALTH_CONTRIBUTION_TAX / 100);
  let socials = socialSec;
  if (isEUCitizenOrBulgarianPR) socials += healthIns;
  const taxableIncome = grossIncome - socials;
  const incomeTax = taxableIncome * (BG_INCOME_TAX / 100);

  // Withholding
  const preTaxDividends = taxableIncome - incomeTax;
  const withholdingTax = preTaxDividends * (BG_DIVIDEND_TAX / 100);

  const totalTax = socials + incomeTax + withholdingTax;
  const netIncome = grossIncome - totalTax;
  const effectiveTax = (totalTax / grossIncome) * 100;

  return (
    <>
      <table>
        <tr>
          <td>FX rate</td>
          <td>USD 1 = BGN {(USD_EUR * EUR_BGN).toFixed(5)}</td>
        </tr>
        <tr>
          <td>Gross income</td>
          <td>BGN {fmt(grossIncome)}</td>
        </tr>
        <tr>
          <td>Insurance base*</td>
          <td>
            {fmt(MIN_MONTHLY_INSURANCE_BASE_BGN)} * 12 = BGN {fmt(yearlyBase)}
          </td>
        </tr>
        <tr>
          <td>Social contributions</td>
          <td>
            {fmt(yearlyBase)} * {BG_SOCIAL_CONTRIBUTION_TAX}% = BGN{" "}
            {fmt(socialSec)}
          </td>
        </tr>
        {isEUCitizenOrBulgarianPR && (
          <>
            <tr>
              <td>Health contributions**</td>
              <td>
                {fmt(yearlyBase)} * {BG_HEALTH_CONTRIBUTION_TAX}% = BGN{" "}
                {fmt(healthIns)}
              </td>
            </tr>
            <tr>
              <td>Total socials</td>
              <td>
                {fmt(socialSec)} + {fmt(healthIns)} = BGN {fmt(socials)}
              </td>
            </tr>
          </>
        )}
        <tr>
          <td>Taxable income</td>
          <td>
            {fmt(grossIncome)} - {fmt(socials)} = BGN {fmt(taxableIncome)}
          </td>
        </tr>
        <tr>
          <td>Income tax</td>
          <td>
            {fmt(taxableIncome)} * {BG_INCOME_TAX}% = BGN {fmt(incomeTax)}
          </td>
        </tr>
        <tr>
          <td>Pre-tax dividends</td>
          <td>
            {fmt(taxableIncome)} - {fmt(incomeTax)} = BGN {fmt(preTaxDividends)}
          </td>
        </tr>
        <tr>
          <td>Dividend tax</td>
          <td>
            {fmt(preTaxDividends)} * {BG_DIVIDEND_TAX}% = {fmt(withholdingTax)}
          </td>
        </tr>
        <tr>
          <td>Total tax</td>
          <td>
            {fmt(socials)} + {fmt(incomeTax)} + {fmt(withholdingTax)} = BGN{" "}
            {fmt(totalTax)}
          </td>
        </tr>
        <tr>
          <td>Net income</td>
          <td>
            {fmt(grossIncome)} - {fmt(totalTax)} = BGN {fmt(netIncome)}
          </td>
        </tr>
        <tr>
          <td>Effective tax</td>
          <td>
            {fmt(totalTax)} / {fmt(grossIncome)} ={" "}
            <strong>{effectiveTax.toFixed(2)}%</strong>
          </td>
        </tr>
      </table>

      <p>
        * All profits are distributed as dividends. Because no salary is paid
        out, the personal income is zero, bringing the insurance base down to
        BGN {fmt(MIN_MONTHLY_INSURANCE_BASE_BGN)} per month (
        <ExternalLink href="https://taxsummaries.pwc.com/bulgaria/individual/other-taxes">
          2023
        </ExternalLink>
        ).
      </p>

      <p>
        ** The health insurance is only payable by EU citizens or Bulgarian
        permanent residents.
      </p>
    </>
  );
};

//////////////////////////////////
//////////// ITALY 🇮🇹 ////////////
//////////////////////////////////

interface ItalyProps extends CommonProps {
  isInSouthOfItaly?: boolean;
}

const InpatriateRegimeInItaly = ({
  grossYearlyIncomeUSD,
  isInSouthOfItaly = true,
}: ItalyProps) => {
  const SOCIAL_SECURITY_TAX = 26;

  const grossIncome = grossYearlyIncomeUSD * USD_EUR;

  const taxRate = 100 - (isInSouthOfItaly ? 90 : 70);
  const taxableIncome = grossIncome * (taxRate / 100);

  const socialContrib = taxableIncome * (SOCIAL_SECURITY_TAX / 100);
  const incomeTax = italianIncomeTax(taxableIncome);
  const totalTax = socialContrib + incomeTax;

  const netIncome = grossIncome - totalTax;
  const effectiveTax = (totalTax / grossIncome) * 100;

  return (
    <>
      <table>
        <tr>
          <td>FX rate</td>
          <td>USD 1 = EUR {USD_EUR}</td>
        </tr>
        <tr>
          <td>Gross income</td>
          <td>EUR {fmt(grossIncome)}</td>
        </tr>
        <tr>
          <td>Taxable income</td>
          <td>
            {fmt(grossIncome)} * {taxRate}% = EUR {fmt(taxableIncome)}
          </td>
        </tr>
        <tr>
          <td>Social security</td>
          <td>
            {fmt(taxableIncome)} * {SOCIAL_SECURITY_TAX}% = EUR{" "}
            {fmt(socialContrib)}
          </td>
        </tr>
        <tr>
          <td>Income tax*</td>
          <td>EUR {fmt(incomeTax)}</td>
        </tr>
        <tr>
          <td>Total tax</td>
          <td>
            {fmt(socialContrib)} + {fmt(incomeTax)} = EUR {fmt(totalTax)}
          </td>
        </tr>
        <tr>
          <td>Net income</td>
          <td>
            {fmt(grossIncome)} - {fmt(totalTax)} = EUR {fmt(netIncome)}
          </td>
        </tr>
        <tr>
          <td>Effective tax</td>
          <td>
            {fmt(totalTax)} / {fmt(grossIncome)} ={" "}
            <strong>{effectiveTax.toFixed(2)}%</strong>
          </td>
        </tr>
      </table>

      <p>
        * Income tax is progressive. See the tax brackets{" "}
        <ExternalLink href="https://taxsummaries.pwc.com/italy/individual/taxes-on-personal-income">
          here
        </ExternalLink>
        .
      </p>

      <p>
        Based in part on{" "}
        <ExternalLink href="https://youtu.be/kaHwPQ9r1MA">
          this video
        </ExternalLink>
        .
      </p>
    </>
  );
};

const italianIncomeTax = (incomeEUR: number) => {
  // https://taxsummaries.pwc.com/italy/individual/taxes-on-personal-income
  const brackets = [
    [0, 15_000, 23],
    [15_000, 28_000, 25],
    [28_000, 50_000, 35],
    [50_000, incomeEUR, 43],
  ];

  // https://stackoverflow.com/a/63231982
  let tax = 0;
  for (const bracket of brackets) {
    if (incomeEUR < bracket[1]) {
      tax += (incomeEUR - bracket[0]) * (bracket[2] / 100);
      break;
    } else {
      tax += (bracket[1] - bracket[0]) * (bracket[2] / 100);
    }
  }
  return tax;
};

////////////////////////////////////
//////////// ROMANIA 🇷🇴 ////////////
////////////////////////////////////

// https://wageindicator.org/salary/minimum-wage/romania
const MIN_MONTHLY_WAGE_RON = 3_000; // 2023

const MicroEnterpriseInRomania = ({ grossYearlyIncomeUSD }: CommonProps) => {
  const LABOR_INSURANCE_TAX = 2.25;
  const TURNOVER_TAX = 1;
  const PENSION_INSURANCE_TAX = 25;
  const HEALTH_INSURANCE_TAX = 10;
  const PERSONAL_DEDUCTION = 20; // see Art. 77
  const INCOME_TAX = 10;
  const DIVIDEND_TAX = 8;

  const grossIncome = grossYearlyIncomeUSD * USD_EUR * EUR_RON;

  // Employer
  const salary = MIN_MONTHLY_WAGE_RON * 12;
  const laborInsurance = salary * (LABOR_INSURANCE_TAX / 100);
  const turnoverTax = grossIncome * (TURNOVER_TAX / 100);
  const totalEmployerTax = laborInsurance + turnoverTax;
  const netIncome = grossIncome - salary - totalEmployerTax;

  // Employee
  const pensionIns = salary * (PENSION_INSURANCE_TAX / 100);
  const healthIns = salary * (HEALTH_INSURANCE_TAX / 100);
  const personalDeduction = salary * (PERSONAL_DEDUCTION / 100);
  const taxableIncome = salary - pensionIns - healthIns - personalDeduction;
  const incomeTax = taxableIncome * (INCOME_TAX / 100);
  const totalEmployeeTax = pensionIns + healthIns + incomeTax;
  const netSalary = salary - totalEmployeeTax;

  // Dividends
  const preTaxDividends = netIncome;
  const dividendTax = preTaxDividends * (DIVIDEND_TAX / 100);
  // If dividends exceed 6 x minimum gross salary,
  // you must pay health insurance at 10% on the aforementioned threshold.
  // https://taxsummaries.pwc.com/romania/individual/income-determination
  const healthInsuranceBase = MIN_MONTHLY_WAGE_RON * 6;
  let healthInsuranceOnDivs =
    healthInsuranceBase * (HEALTH_INSURANCE_TAX / 100) - healthIns; // both paid at the personal level
  if (healthInsuranceOnDivs < 0) healthInsuranceOnDivs = 0; // always true
  const totalDividendTax = dividendTax + healthInsuranceOnDivs;
  const afterTaxDividends = preTaxDividends - totalDividendTax;

  const totalTax = totalEmployerTax + totalEmployeeTax + totalDividendTax;
  const afterTaxIncome = grossIncome - totalTax;
  const effectiveTax = (totalTax / grossIncome) * 100;

  return (
    <>
      <table>
        <tr>
          <td>FX rate</td>
          <td>USD 1 = RON {(USD_EUR * EUR_RON).toFixed(5)}</td>
        </tr>
        <tr>
          <td>Turnover</td>
          <td>RON {fmt(grossIncome)}</td>
        </tr>
        <tr>
          <td>Total tax</td>
          <td>
            {fmt(totalEmployerTax)} + {fmt(totalEmployeeTax)} +{" "}
            {fmt(totalDividendTax)} = RON {fmt(totalTax)}
          </td>
        </tr>
        <tr>
          <td>After-tax income</td>
          <td>
            {fmt(grossIncome)} - {fmt(totalTax)} = RON {fmt(afterTaxIncome)}
          </td>
        </tr>
        <tr>
          <td>Effective tax</td>
          <td>
            {fmt(totalTax)} / {fmt(grossIncome)} ={" "}
            <strong>{effectiveTax.toFixed(2)}%</strong>
          </td>
        </tr>
      </table>

      <h3>Employer</h3>

      <table>
        <tr>
          <td>Turnover</td>
          <td>RON {fmt(grossIncome)}</td>
        </tr>
        <tr>
          <td>Salary</td>
          <td>
            {fmt(MIN_MONTHLY_WAGE_RON)} * 12 = RON {fmt(salary)}
          </td>
        </tr>
        <tr>
          <td>Labor insurance</td>
          <td>
            {fmt(salary)} * {LABOR_INSURANCE_TAX}% = RON {fmt(laborInsurance)}
          </td>
        </tr>
        <tr>
          <td>Turnover tax</td>
          <td>
            {fmt(grossIncome)} * {TURNOVER_TAX}% = RON {fmt(turnoverTax)}
          </td>
        </tr>
        <tr>
          <td>Total tax</td>
          <td>
            {fmt(laborInsurance)} + {fmt(turnoverTax)} = RON{" "}
            {fmt(totalEmployerTax)}
          </td>
        </tr>
        <tr>
          <td>Net income</td>
          <td>
            {fmt(grossIncome)} - {fmt(salary)} - {fmt(totalEmployerTax)} = RON{" "}
            {fmt(netIncome)}
          </td>
        </tr>
      </table>

      <p>
        Note: minimum wage is RON {fmt(MIN_MONTHLY_WAGE_RON)} per month (
        <ExternalLink href="https://wageindicator.org/salary/minimum-wage/romania">
          2023
        </ExternalLink>
        ).
      </p>

      <h3>Employee</h3>

      <table>
        <tr>
          <td>Gross salary</td>
          <td>
            {fmt(MIN_MONTHLY_WAGE_RON)} * 12 = RON {fmt(salary)}
          </td>
        </tr>
        <tr>
          <td>Pension insurance</td>
          <td>
            {fmt(salary)} * {PENSION_INSURANCE_TAX}% = RON {fmt(pensionIns)}
          </td>
        </tr>
        <tr>
          <td>Health insurance</td>
          <td>
            {fmt(salary)} * {HEALTH_INSURANCE_TAX}% = RON {fmt(healthIns)}
          </td>
        </tr>
        <tr>
          <td>Personal deduction*</td>
          <td>
            {fmt(salary)} * {PERSONAL_DEDUCTION}% = RON {personalDeduction}
          </td>
        </tr>
        <tr>
          <td>Taxable income</td>
          <td>
            {fmt(salary)} - {fmt(pensionIns)} - {fmt(healthIns)} -{" "}
            {fmt(personalDeduction)} = RON {fmt(taxableIncome)}
          </td>
        </tr>
        <tr>
          <td>Income tax</td>
          <td>
            {fmt(taxableIncome)} * {INCOME_TAX}% = RON {fmt(incomeTax)}
          </td>
        </tr>
        <tr>
          <td>Total tax</td>
          <td>
            {fmt(pensionIns)} + {fmt(healthIns)} + {fmt(incomeTax)} = RON{" "}
            {fmt(totalEmployeeTax)}
          </td>
        </tr>
        <tr>
          <td>Net salary</td>
          <td>
            {fmt(salary)} - {fmt(totalEmployeeTax)} = RON {fmt(netSalary)}
          </td>
        </tr>
      </table>

      <p>
        * See Article 77 of the{" "}
        <ExternalLink href="https://static.anaf.ro/static/10/Anaf/legislatie/Cod_fiscal_norme_2023.htm">
          Fiscal Code
        </ExternalLink>{" "}
        for a table of personal deductions (deducere personală or DP) based on
        salary.
      </p>

      <h3>Shareholder</h3>

      <table>
        <tr>
          <td>Pre-tax dividends</td>
          <td>{fmt(preTaxDividends)}</td>
        </tr>
        <tr>
          <td>Dividend tax</td>
          <td>
            {fmt(preTaxDividends)} * {DIVIDEND_TAX}% = RON {fmt(dividendTax)}
          </td>
        </tr>
        <tr>
          <td>Health ins base</td>
          <td>
            {fmt(MIN_MONTHLY_WAGE_RON)} * 6 = RON {fmt(healthInsuranceBase)}
          </td>
        </tr>
        <tr>
          <td>Health insurance**</td>
          <td>
            {fmt(healthInsuranceBase)} * {HEALTH_INSURANCE_TAX}% -{" "}
            {fmt(healthIns)} = RON {fmt(healthInsuranceOnDivs)}
          </td>
        </tr>
        <tr>
          <td>After-tax dividends</td>
          <td>
            {fmt(preTaxDividends)} - {fmt(totalDividendTax)} = RON{" "}
            {fmt(afterTaxDividends)}
          </td>
        </tr>
      </table>

      <p>
        ** Dividend income is also considered towards health insurance
        contributions. Max base is RON {fmt(healthInsuranceBase)} = 6 * min wage
        RON {fmt(MIN_MONTHLY_WAGE_RON)}/mo (2023).
      </p>

      <p>
        Based in part on{" "}
        <ExternalLink href="https://zugimpex.com/knowledgebase/micro-enterprise-in-romania-1-corporate-tax.html">
          this article
        </ExternalLink>
        .
      </p>
    </>
  );
};

function ExternalLink(props: HTMLAttributes<HTMLAnchorElement>) {
  return <a rel="nofollow noopener noreferrer" target="_blank" {...props} />;
}
