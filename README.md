# nfp-womens-health

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add your Mapbox token:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Get your Mapbox token from: https://account.mapbox.com/access-tokens/

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Deployment

This project is configured to deploy to Cloudflare Pages. Make sure to add the following environment variable in your Cloudflare Pages settings:

- `VITE_MAPBOX_TOKEN`: Your Mapbox API token
