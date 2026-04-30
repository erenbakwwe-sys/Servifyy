// ============================================
// ROUTER - Simple hash-based SPA router
// ============================================

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeEachHook = null;
    
    window.addEventListener('hashchange', () => this.resolve());
    window.addEventListener('popstate', () => this.resolve());
  }

  on(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  beforeEach(hook) {
    this.beforeEachHook = hook;
    return this;
  }

  navigate(path) {
    window.location.hash = path;
  }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = {};

    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value || '');
      });
    }

    // Find matching route
    let matchedHandler = null;
    let routeParams = {};

    for (const [routePath, handler] of Object.entries(this.routes)) {
      const match = this.matchRoute(routePath, path);
      if (match) {
        matchedHandler = handler;
        routeParams = { ...match, ...params };
        break;
      }
    }

    if (!matchedHandler) {
      // Try default route
      if (this.routes['*']) {
        matchedHandler = this.routes['*'];
      } else {
        this.navigate('/');
        return;
      }
    }

    if (this.beforeEachHook) {
      const result = this.beforeEachHook(path, routeParams);
      if (result === false) return;
    }

    this.currentRoute = path;
    matchedHandler(routeParams);
  }

  matchRoute(routePath, actualPath) {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    if (routeParts.length !== actualParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = actualParts[i];
      } else if (routeParts[i] !== actualParts[i]) {
        return null;
      }
    }

    return params;
  }

  start() {
    this.resolve();
  }
}

export default Router;
