# 04 — Business, Operations & Payments

## Client's words (verbatim)

> The other thing which is important, lets say we finish development of the
> first version of the game, I still be needing servers right? Even to
> implement ways to spend the money I need to implement Stripe or other
> platforms to be able actually get paid. For that I need to have a business
> license correct? Also probaly there are additional expenses about which I
> don't even have any idea, could you explain me more about that part?

## Our response (sent)

> Yes, you'll need servers for as long as the game is live. They store player
> accounts and progress, run the shared world map, and check every purchase
> and battle so nobody can cheat.
>
> **Payments.** In mobile apps on the App Store and Google Play, in-game items
> such as troop cards and officer cards generally have to be sold through
> Apple's and Google's own payment systems, not Stripe. They usually take 15%
> of revenue for smaller developers (under about $1M per year) and 30% above
> that. Stripe can be used for a web version of the game, or on a website in
> situations the store rules allow. The stores also handle most of the sales
> tax/VAT on in-app purchases.
>
> **Business licence.** In most cases, yes, you should have a registered
> business. Apple requires a company account to publish under a company name,
> and a business is also important for receiving payouts, paying tax and
> protecting you personally. The exact requirements depend on your country, so
> I'd recommend speaking with a local accountant before launch.
>
> **Other costs to plan for:**
> - **Store accounts:** Apple Developer is $99 per year; Google Play is a
>   one-time $25 fee.
> - **Servers and database:** roughly $50–200 per month at launch, growing
>   with the number of players. A busy shared-world game can reach several
>   hundred to several thousand dollars per month.
> - **Content delivery (downloading game assets), backups, and crash and
>   analytics tools:** often cheap or free at first, increasing with player
>   numbers.
> - **Legal:** a privacy policy and terms of service, data-protection
>   compliance (such as GDPR in Europe), age ratings, and checking card-pack
>   rules in certain countries. Registering the "Blitzmire" trademark is also
>   a good idea.
> - **Accountant and business bank account.**
> - **Marketing and player acquisition:** this is often the **largest cost**
>   after development, because players have to find the game.
> - **Community and support:** a Discord server, moderators and player
>   support.
> - **Ongoing development and maintenance:** updates, bug fixes, new content
>   and events after launch.
>
> I'll include a clear **Operating Cost & Business Setup overview** in
> Phase 1, so you know the expected monthly and yearly costs before launch
> and nothing comes as a surprise.
>
> Thank you again for sharing all of this. Your ideas show a strong
> understanding of what keeps players in this kind of game, and with proper
> planning I'm confident we can build something that feels fair, exciting and
> different from other games.

## Agreed
- A Phase 1 deliverable: an **Operating Cost & Business Setup overview**
  (monthly and yearly costs, payment platforms, company and tax checklist).

## Implementation notes
- **Country not yet confirmed.** Licence and tax advice stays general until
  it is; a local accountant or lawyer should confirm the details.
- **Store payment rules have been changing.** US and EU rulings allow external
  payment links in some cases. Re-check the current Apple and Google policies
  before giving firm advice or designing the shop.
- Purchase validation must be server-side (receipt verification for Apple and
  Google; webhooks for Stripe on the web), with an idempotent grant ledger.
- Apple requires that users can delete their account in the app. A privacy
  policy URL is required by both stores.
- Running-cost estimates above are rough assumptions. Size them against the
  player count per map from file 03.
