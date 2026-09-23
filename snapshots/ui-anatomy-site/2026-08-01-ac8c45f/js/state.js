export const state = {
  activeLayout: 'landing',
  lastBasicType: 'landing',  // tracks last selected basic type for filtering industry dropdown
  activeComp: null,      // id of currently hovered component
  pinnedComp: null,      // id of clicked/pinned component (tooltip stays open)
  browserOpen: true,
  outlinesOn: true,      // Show outlines by default
  searchQuery: '',
  dummyMode: true,       // Show dummy content by default
  heroBg: 'solid',
};
