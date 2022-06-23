import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

type SecurityPayload = {
  data: {
    securities: {
      lastTrade: {
        price: string;
      };
    }[];
  };
};

@customElement("stock-price-badge")
export class StockPriceBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      font-family: sans-serif;

      padding: 0.5rem 0.75rem;
      border-radius: 99rem;
      background-color: var(--background);
      border: 2px solid var(--border-color);
    }

    p {
      margin: 0;
      padding: 0;
      font-size: 1rem;
      font-weight: bold;
    }

    div {
      display: flex;
      flex-direction: row;
      gap: 0.25rem;
    }
  `;

  /**
   * Your Yuzu API key
   */
  @property({ type: String })
  apiKey = "";

  /**
   * The symbol to subscribe to.
   * E.g. AAPL, MSFT, BRK.A
   */
  @property({ type: String })
  symbol = "";

  @property({ type: String })
  backgroundColor = "#cbd5e1"; // Tailwind slate-300

  @property({ type: String })
  borderColor = "#64748b"; // Tailwind slate-500

  private currentPrice: String = "";

  private tradeStream: EventSource | null = null;

  async connectedCallback() {
    super.connectedCallback();
    this.style.setProperty("--background", this.backgroundColor);
    this.style.setProperty("--border-color", this.borderColor);

    this.currentPrice = await this.fetchPrice();
    this.requestUpdate();
    this.startStream();
  }

  disconnectedCallback() {
    if (this.tradeStream) {
      this.tradeStream.close();
    }
  }

  render() {
    return html`
      <div>
        <p>${this.symbol}</p>
        <p>$${this.currentPrice}</p>
      </div>
    `;
  }

  startStream() {
    const symbols = `S:T:${this.symbol}`;
    const url = `https://sse.yuzu.dev/sse?streams=${symbols}&token=${this.apiKey}`;
    this.tradeStream = new EventSource(url);
    this.tradeStream.addEventListener("message", (message) => {
      this.currentPrice = parseFloat(JSON.parse(message.data).price).toFixed(2);
      this.requestUpdate();
    });
  }

  private async fetchPrice() {
    const query = `
      query FetchSecurityPrice($symbol: String!) {
        securities(input: { symbols: [$symbol] }) {
          lastTrade {
            price
          }
        }
      }
    `;

    const result = await fetch("https://graph.yuzu.dev/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          symbol: this.symbol,
        },
      }),
    });

    const resultBody = (await result.json()) as SecurityPayload;
    return parseFloat(resultBody.data.securities[0].lastTrade.price).toFixed(2);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stock-price-badge": StockPriceBadge;
  }
}
