## 🍋 Stock Price Badge Demo

This demo is a drop-in component to render real-time updating stock prices on your website. The entire component is a self-contained web component built using [Lit](https://lit.dev/) and the [Yuzu Stock and Crypto API](https://yuzu.dev).

To use in your own website, go grab an API key from [Yuzu.dev](https://yuzu.dev).

Then, drop this line in the `<head>` of your html:

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stock Price Badge demo</title>

    <!-- 👇 These are the two lines you want -->
    <script type="module" 
            src="https://unpkg.com/@yuzu-hq/stock-price-badge/dist/stock-price-badge.es.js"></script>
  </head>
```

And then on your page, just render it like any other HTML element:

```html
<div>
  <stock-price-badge
    symbol="BRK.A"
    apiKey="YOUR API KEY">
  </stock-price-badge>
```

And voila! You're off to the races 🐎.

Leave us an issue for comments, requests, or feedback!
