# Salim Ahmed — Portfolio

A personal portfolio website built with HTML, CSS, and Vanilla JavaScript. It features a modern "Material You 3" inspired design (Green & Gold variant), subtle glassmorphism effects, and smooth scroll animations.

![Portfolio Preview](https://via.placeholder.com/800x450.png?text=Salim+Ahmed+Portfolio)

## Features

- **Dynamic GitHub Integration**: Automatically fetches and displays:
  - Profile statistics (Repositories, Followers, Following)
  - Public Repositories (Live projects synced directly from GitHub)
  - Contribution Heatmap (A visual representation of public GitHub activity over the past year)
- **Modern Design System**: 
  - Material You 3 tonal colour palette (Green & Gold)
  - Glassmorphic UI elements with blur and dynamic glows
  - Buttery smooth scroll-reveal animations (`IntersectionObserver`)
- **Fully Responsive**: Adapts seamlessly to mobile, tablet, and desktop screens.
- **Zero Dependencies**: Built entirely with Vanilla DOM manipulation and standard web APIs (no React, Vue, or jQuery required).

## Sections

1. **Hero**: Introduction, GitHub avatar, tagline, and live GitHub stats.
2. **About Me**: A short biography detailing background and developer ethos.
3. **Skills**: A categorized grid detailing proficiency in Frontend, Backend, and Tooling.
4. **Experience**: A timeline component detailing professional journey.
5. **Work (Projects)**: A dynamically generated grid of GitHub repositories, sorted by most recently updated.
6. **Activity**: A GitHub-style contribution heatmap pulling live data.
7. **Connect**: Social links (GitHub, X, LinkedIn).

## How It Works

The magic of the portfolio lies in `app.js`, which hits several APIs:

- **GitHub REST API (`/users/salim-web`)**: Fetches profile info and follower counts.
- **GitHub REST API (`/users/salim-web/repos`)**: Fetches all public repositories.
- **Jogruber GitHub Contributions API**: Scrapes the public GitHub profile to generate the history for the activity heatmap.
- **GitHub Events API (`/users/salim-web/events`)**: Overlays live, instant push events on top of the heatmap to bypass any 24-hour API caching delays.

## Running Locally

Because it uses zero build tools or bundlers, running the project locally is incredibly simple.

1. Clone the repository:
   ```bash
   git clone https://github.com/salim-web/portfolio.git
   cd portfolio
   ```

2. Serve the `index.html` file. You can use any local web server. 
   
   If you have Python installed:
   ```bash
   python -m http.server 8000
   ```
   
   Or if you have Node.js / npm installed:
   ```bash
   npx serve .
   ```
   
   Or simply use the **Live Server** extension in VS Code.

3. Open your browser and navigate to `http://localhost:8000` (or the port provided by your server).

## Customization

To make this portfolio your own, edit the top section of `app.js`:

```javascript
// ── CONFIGURATION ──────────────────────────────────────
const GITHUB_USER = 'your-github-username';

const SOCIAL_LINKS = {
  github:   `https://github.com/${GITHUB_USER}`,
  x:        'https://x.com/yourhandle',
  linkedin: 'https://www.linkedin.com/in/your-profile-url/',
};
```

You can also adjust the design palette in `style.css` by modifying the `--md-green-*` and `--md-gold-*` CSS variables in the `:root` pseudo-class.

## License

This project is open-source and available under the MIT License. Feel free to fork, modify, and use it for your own portfolio!
