// Allows side-effect imports like: import './index.scss';
declare module "*.scss";
declare module "*.sass";

// If you also use CSS Modules like: import styles from './index.module.scss';
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}
