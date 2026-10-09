import { Component, type ReactNode } from "react";

export default class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="public-tools" role="alert"><h1>CalNut could not display this page</h1><p>Your saved records have not been deleted. Reload the page and contact the administrator if the problem continues.</p><button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button></main>;
    return this.props.children;
  }
}
