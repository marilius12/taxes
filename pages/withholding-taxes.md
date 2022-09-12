# Withholding taxes

When a company makes a payment to an individual or an entity, it may be required to withold a percentage of the amount and remit it to the tax authority. For example, when an employer pays out a salary, it withholds income tax (as well as payroll deductions) from the employee's paycheck. A company may also withhold taxes when paying out dividends, interest, royalties, rent, and directors fees. Other payments may be exempt from withholding (ex: payments for services to resident companies) or be subject to a lower (or zero) rate (ex: payments to parent companies or major shareholders, i.e. **participation exemption**).

WTH tax applies to **domestically sourced income**. For example, if a US company hires a remote contractor in Canada, it should not withhold any tax from payments because the work is not US-sourced (and the contractor is not a US person). In some countries (ex: US, Canada, UK), payments to **residents** are also exempt from withholding, meaning that they must declare the income and pay taxes later, when filing a tax return. In others (ex: Bulgaria, Mexico), the tax is withheld at the source for both residents and non-residents, therefore the residents do not pay the tax again at the individual level.

## Non-resident WHT

When you earn foreign-source income, a **non-resident withholding tax** will typically be deducted before the payment is received. For example, when, as a foreign person, receive dividends from a US corporation, it will withhold 30% to the IRS since the income is US-sourced. This rate can be reduced if the country you are a tax resident of has a tax treaty with the US (ex: 15% for Canadian residents, see [WTH taxes in US](https://taxsummaries.pwc.com/united-states/corporate/withholding-taxes)) by submitting a W-8BEN form to the IRS. Rental income (along with REITs) is often subject to the standard WTH tax and can't be reduced by a tax treaty.

Unfortunately, the WTH tax is **[non-refundable](https://ibkr.info/node/946)**. However, you may be able to claim a **foreign tax credit** to reduce your domestic tax when filing a tax return. Also, if the tax was withheld by mistake (ex: by a US client even though your service/product was _not_ US-sourced) or at an incorrect rate (ex: a general rate was applied instead of a reduced rate based on a tax treaty), you could file a foreign tax return to claim a refund (ex: Form 1040-NR in US).

The rate of withholding depends on several factors:

- individual tax residency (and any applicable DTTs)
- company domicile (i.e. country of residence)
- stock exchange domicile (if different from the company's domicile)
- security domicile (if it's an ETF, mutual fund, etc.)
- type of investment account (margin, registered, etc.) (see [taxes on investments](./taxes-on-investments.md))

Unfortunately, there may be multiple levels of WTH taxes:

- **Level 1** WTH tax is levied by the country where the company is domiciled
  - ex: if you receive dividends from a US company listed on a US stock exchange, you will incur a US WHT of 10-30%
- **Level 2** WTH tax is levied by the country where the security is listed
  - ex: if you receive dividends from a US-listed ETF that holds international stocks, the fund will incur WHT from its holdings at Level 1, and then you will incur an additional US WHT of 10-30% at Level 2

Read more in [this article](https://indexfundinvestor.eu/2019/03/06/how-do-i-calculate-the-taxes-for-my-etf/). For a US/Canada perspective, see [this white paper](https://www.pwlcapital.com/wp-content/uploads/2018/06/2016-06-17_-Bender-Bortolotti_Foreign_Withholding_Taxes_Hyperlinked.pdf).

## Reducing non-resident WHT

1\. Invest in contries with a **zero** or **low** non-resident WTH tax

- some countries don't have a WTH tax on dividends at Level 1, ex: UK (LON), Ireland (ISE), Hong Kong (HKG), Singapore (SGX)
- other countries have a low WTH tax, ex: 10% in China (SHG)
- NOTE foreign divs from interlisted stocks are still subject to WTH tax
  - ex: US company is listed on both NYSE (USD) and TSX (CAD)
  - Canadian residents will still pay 15% WTH tax even if they buy on TSX
  - WTH tax is applied based on where the company is domiciled (i.e. US)
  - which stock exchange the shares are traded on and in which currency is secondary
- BONUS companies in EM countries tend to have lower P/Es and higher div yield

2\. Invest in funds domiciled in countries that don't levy WTH tax

- some countries don't tax dividends paid to non-residents at Level 2, ex: Ireland (ISE), Luxembourg (XLUX)
  - ex: dividends from a US-listed ETF are subject to 30% WTH tax unless covered by a tax treaty
  - the same underlying stocks could instead be held in an Ireland-listed ETF
  - divs would be taxed at 15% (under US-Ireland treaty, Level 1) and 0% (Ireland fund, Level 2)
- NOTE unliked US-listed ETFs, foreign-listed ETFs are not subject to **US estate tax** at 18-40%

3\. Move to a country with a **lower** WTH rate based on a **tax treaty**

- some countries that signed DTTs have a lower WTH tax
- ex: US WTH tax is generally 30%, but is 10% for tax residents of Bulgaria, Romania, Mexico, etc.
- ex: Japan has a 20% WTH tax that can be reduced to 10-15%

4\. Invest in **domestic companies**

- divs from local companies are often subject to lower tax rates and/or tax credits
  - ex: qualified divs in US, eligible divs in Canada, etc.
- in lower tax brackets, you may be exempt from tax and/or have a negative tax to offset other income
  - NOTE div income above a certain threshold may affect your pension (ex: OAS clawback in Canada)

5\. Earn **capital gains**

- WTH tax is usually _not_ applied to capital gains
- instead of dividends or interest, earn from capital appreciation
  - ex: invest in growth stocks (ex: US tech), sell shares when retiring
  - ex: sell call options for a premium, trade futures, etc.

## Resources

- [PwC WHT rates by country](https://taxsummaries.pwc.com/quick-charts/withholding-tax-wht-rates)
- [US WHT by tax treaty](https://taxsummaries.pwc.com/united-states/corporate/withholding-taxes) (select a country and navigate to Corporate, Withholding taxes)
- [Deloitte Tax Guides](https://dits.deloitte.com/#TaxGuides) (click on a country and scroll down to Withholding tax table)
