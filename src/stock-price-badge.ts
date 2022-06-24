import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

type SecurityPayload = {
  data: {
    securities: {
      lastTrade: {
        price: string;
      };
      aggregates: {
        close: string;
      }[];
    }[];
  };
};

type ColorSet = {
  background: string;
  border: string;
};

const up: ColorSet = {
  background: "#dcfce7", // Tailwind green-100
  border: "#16a34a", // Tailwind green-600
};

const down: ColorSet = {
  background: "#fee2e2", // Tailwind red-100
  border: "#dc2626", // Tailwind red-600
};

@customElement("stock-price-badge")
export class StockPriceBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      font-family: sans-serif;

      padding: 0.3rem 0.5rem;
      border-radius: 99rem;
      background-color: var(--background-color);
      border: 2px solid var(--border-color);
    }

    p {
      margin: 0;
      padding: 0;
      font-size: 0.75rem;
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
  @property({ type: String, attribute: "api-key" })
  apiKey = "";

  /**
   * The symbol to subscribe to.
   * E.g. AAPL, MSFT, BRK.A
   */
  @property({ type: String })
  symbol = "";

  @state()
  private benchmark: number = 0;
  @state()
  private currentPrice: number = 0;

  private tradeStream: EventSource | null = null;

  async connectedCallback() {
    super.connectedCallback();
    if (!this.apiKey) {
      console.error("⚠️ No Yuzu API key provided for stock-price-badge component")
      return
    }

    const { lastPrice, benchmark } = await this.fetchPrice();
    this.benchmark = benchmark;
    this.currentPrice = lastPrice;

    this.updateColors();
    this.startStream();
  }

  disconnectedCallback() {
    if (this.tradeStream) {
      this.tradeStream.close();
    }
  }

  render() {
    if (!this.apiKey) {
      return null
    }

    return html`
      <div>
        <p>${this.symbol}</p>
        <p>$${this.currentPrice.toFixed(2)}</p>
      </div>
    `;
  }

  startStream() {
    const symbols = `S:T:${this.symbol}`;
    const url = `https://sse.yuzu.dev/sse?streams=${symbols}&token=${this.apiKey}`;
    this.tradeStream = new EventSource(url);
    this.tradeStream.addEventListener("message", (message) => {
      this.currentPrice = parseFloat(JSON.parse(message.data).price);
      this.updateColors();
    });
  }

  private async fetchPrice(): Promise<{
    lastPrice: number;
    benchmark: number;
  }> {
    const query = `
      query FetchSecurityPrice($symbol: String!) {
        securities(input: { symbols: [$symbol] }) {
          lastTrade {
            price
          }
          aggregates(input: { limit: 1 }) {
            close
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
    return {
      lastPrice: parseFloat(resultBody.data.securities[0].lastTrade.price),
      benchmark: parseFloat(resultBody.data.securities[0].aggregates[0].close),
    };
  }

  private updateColors() {
    const colorSet = this.benchmark > this.currentPrice ? down : up;

    this.style.setProperty("--background-color", colorSet.background);
    this.style.setProperty("--border-color", colorSet.border);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stock-price-badge": StockPriceBadge;
  }
}
