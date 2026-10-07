/// <reference types="astro/client" />

// Single-registration guards for client scripts that must run once per page
// lifecycle. View Transitions re-runs module scripts after navigation, so each
// component sets a window flag after binding its listeners the first time.
interface Window {
  __backToTopBound__?: boolean;
  __codeBlockActionsBound__?: boolean;
  __headerBound__?: boolean;
  __headerMobileMenuBound__?: boolean;
  __langSwitcherBound__?: boolean;
  __scrollIndicatorBound__?: boolean;
  __videoEmbedBound__?: boolean;
  __postTocBound__?: boolean;
  __tableHoverBound__?: boolean;
}
