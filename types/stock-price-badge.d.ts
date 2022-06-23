import { LitElement } from 'lit';
export declare class MyElement extends LitElement {
    static styles: import("lit").CSSResult;
    /**
     * Your Yuzu API key
     */
    apiKey: string;
    /**
     * The symbol to subscribe to.
     * E.g. AAPL, MSFT, BRK.A
     */
    symbol: string;
    private currentPrice;
    private tradeStream;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    startStream(): void;
    private fetchPrice;
}
declare global {
    interface HTMLElementTagNameMap {
        'stock-price-badge': MyElement;
    }
}
