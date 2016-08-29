define(`

/*
* always
*/
#alerts,
#ticker,
#yt-dialog-bg,
#yt-consent-dialog,
.yt-consent,
.yt-consent-banner,
.cookie-alert
{
    display: none !important;
}

.draggborder
{
    background: linear-gradient(grey 0%,
        grey 20%, transparent 20%,
        transparent 40%, grey 40%,
        grey 60%, transparent 60%
    ) !important;
    margin: 0 5px !important;
}

/*
* non-fullscreen watchpage
*/
.watchpage:not(.fullscreen) #masthead-positioner,
.watchpage:not(.fullscreen) #content
{
    display: block;
}
.watchpage:not(.fullscreen) .player-width
{
    width: calc(100% - 350px) !important;
}


/*
* fullscreen watchpage
*/
.watchpage.fullscreen body
{
    overflow: hidden;
}
.watchpage.fullscreen #masthead-positioner,
.watchpage.fullscreen #content
{
    display: none;
}
.watchpage.fullscreen .player-width
{
    width: 100% !important;
}


/*
* watchpage
*/
/* sidebar */
.watchpage body
{
    overflow-x: hidden !important;
}
.watchpage #watch7-main-container
{
    overflow: hidden !important;
}
.watchpage #content
{
    width: 340px !important;
    margin: 0 !important;
    overflow-x: hidden !important;
    position: absolute !important;
    top: 27px !important;
    right: 5px !important;
}
.watchpage #watch7-content
{
    width: 100% !important;
}
.watchpage .watch #content.content-alignment
{
    min-width: 0 !important;
}
/* menu */
#appbar-guide-menu
{
    position: absolute;
    top: 40px;
    right: 115px !important;
    max-width: 230px;
}
/* searchbar */
.watchpage #masthead-positioner
{
    width: 340px !important;
    position: absolute !important;
    right: 5px !important;
    left: auto !important;
}
.watchpage #appbar-guide-button-container,
.watchpage #masthead-positioner-height-offset,
.watchpage #footer-container,
.watchpage #yt-masthead-user,
.watchpage #action-panel-overflow-button,
.watchpage #yt-masthead-signin
{
    display: none !important;
}
.watchpage #masthead-search-terms
{
    margin-left: 10px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
}
.watchpage #yt-masthead #search-btn .yt-uix-button-content
{
    margin: 0 8px !important;
}
.watchpage #yt-masthead .yt-masthead-logo-container
{
    width: auto !important;
}
.watchpage #yt-masthead-container
{
    min-width: 0px !important;
    padding: 3px 8px !important;
}
/* video title */
.watchpage #appbar-guide-menu
{
    right: 0 !important;
    left: auto !important;
    width: 315px !important;
}
.watchpage #watch-headline-title
{
    padding-top: 10px !important;
}
.watchpage #eow-title
{
    font-size: 0.7em;
}
.watchpage #watch7-views-info
{
    position: absolute !important;
    width: 100% !important;
}
.watchpage .watch-view-count
{
    position: initial !important;
}
/* share */
.watchpage #watch-action-panels
{
    display: none !important;
}
/* description */
#watch-description-text
{
    max-height: 800px; /* not !important */
    transition-property: max-height;
    transition-duration: 0.3s;
}
/* discussion */
.watchpage #watch-discussion
{
    padding: 5px !important;
}
.watchpage #watch-discussion
{
    max-height: 25px !important;
    cursor: pointer !important;
    transition-property: max-height;
    transition-duration: 2s;
    transition-timing-function: cubic-bezier(0, 1, 1, 1);
    transition-delay: -1.2s;
}
/* related videos */
.watchpage #watch7-sidebar
{
    width: 340px !important;
    margin: 0 !important;
    padding: 0px !important;
    clear: left !important;
    top: 0 !important;
}
.watchpage #watch7-sidebar-contents
{
    padding-left: 0px !important;
}
.watchpage .video-list-item.related-list-item
{
    margin-left: -5px !important;
    margin-right: -3px !important;
}
.watchpage .autoplay-bar .checkbox-on-off,
.watchpage .autoplay-bar .watch-sidebar-head
{
    display: none !important;
}
.watchpage #watch7-sidebar-contents .watch-sidebar-section:first-child
{
    z-index: 3;
}
.watchpage #watch7-sidebar-contents .watch-sidebar-section:nth-child(2)
{
    margin-top: -1px !important;
}
.watchpage #ytp-menu-autoplay,
.watchpage #ytp-menu-autoplay ~ *
{
    display: none !important;
}

/* block-elements in sidebar */
.watchpage .yt-card.yt-card-has-padding
{
    padding: 5px !important;
}

/* video player */
.watchpage #player-api,
.watchpage #external_player
{
    position: fixed !important;
    margin: 0px !important;
    padding: 0px !important;
    left: 0px !important;
}
.watchpage .player-height:not(#watch-appbar-playlist)
{
    height: 100% !important;
}
.watchpage #player
{
    margin-top: 0px !important;
    min-width: 0px !important;
    max-width: none !important;
    width: auto !important;
    top:0px !important;
}
.watchpage .html5-main-video,
.watchpage .html5-video-container,
.watchpage .html5-video-content
{
    width: 100% !important;
    left: 0 !important;
    height: 100% !important;
}
.watchpage .html5-main-video
{
    top: auto !important;
}
.watchpage .ytp-chrome-bottom
{
    left: auto !important;
    right: auto !important;
    margin-left: auto !important;
    margin-right: auto !important;
    position: relative;
    bottom: 40px !important;
}
.ytp-storyboard-framepreview /* bad looking and misplaced preview while seeking */
{
    display: none;
}
/* shift seek preview and seek preview strip to left */
.watchpage .ytp-tooltip.ytp-bottom.ytp-preview
{
    top: unset !important;
    bottom: 60px !important;
}
@media (min-width: 1700px) {
    .watchpage .ytp-storyboard,
    .watchpage .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 817px)); }
    .watchpage.fullscreen .ytp-storyboard,
    .watchpage.fullscreen .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 637px)); }
}
@media (min-width: 1300px) and (max-width: 1699px) {
    .watchpage .ytp-storyboard,
    .watchpage .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 607px)); }
    .watchpage.fullscreen .ytp-storyboard,
    .watchpage.fullscreen .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 427px)); }
}
@media (min-width: 660px) and (max-width: 1299px) {
    .watchpage .ytp-storyboard,
    .watchpage .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 497px)); }
    .watchpage.fullscreen .ytp-storyboard,
    .watchpage.fullscreen .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 317px)); }
}
@media (min-width: 0px) and (max-width: 659px) {
    .watchpage .ytp-storyboard,
    .watchpage .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 317px)); }
    .watchpage.fullscreen .ytp-storyboard,
    .watchpage.fullscreen .ytp-tooltip.ytp-bottom.ytp-preview
    { transform: translateX(calc(50vw - 207px)); }
}

/* add/share button */
.watchpage .action-panel-trigger-share,
.watchpage .yt-uix-clickcard .addto-button
{
    display: none !important;
}
.watchpage #formats-button-small,
.watchpage #load-comments-button
{
    display: inline !important;
}

/* playlist */
.watchpage #player-playlist
{
    max-width: 100% !important;
}
.watchpage #watch-appbar-playlist
{
    position: absolute !important;
    right: 5px !important;
    left: calc(100% - 335px) !important;
    top: 220px !important;
    max-height: 390px !important;
}
.watchpage.playlist #watch-header.yt-card
{
    margin-bottom: 405px !important;
}
.watchpage.playlist #watch7-headline
{
    max-height: 68px !important;
    min-height: 68px !important;
    overflow: hidden;
}

`);
