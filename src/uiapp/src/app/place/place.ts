export interface Place {
  path: string;
  showInSideNav: boolean;
  component: any; // Using 'any' for now, will refine if specific component type is needed
}
