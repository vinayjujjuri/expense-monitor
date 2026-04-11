import { DefaultSession } from "next-auth";

export type AppSessionUser = {
  role?: string | null;
} & DefaultSession["user"];

export type MenuLinkItem = {
  label: string;
  href: string;
  public?: boolean;
  admin?: boolean;
  highlight?: boolean;
};

export type MenuDropdownChild = {
  label: string;
  href: string;
};

export type MenuDropdownItem = {
  label: string;
  children: MenuDropdownChild[];
  admin?: boolean;
};

export type MenuItem = MenuLinkItem | MenuDropdownItem;

export type NotificationBellProps = {
  count: number;
  mobile?: boolean;
};

export type DesktopDropdownProps = {
  item: MenuDropdownItem;
  pathname: string;
};

export type DesktopLinkProps = {
  item: MenuLinkItem;
  pathname: string;
};

export type MobileDropdownProps = {
  item: MenuDropdownItem;
  pathname: string;
  onNavigate: () => void;
};

export type MobileLinkProps = {
  item: MenuLinkItem;
  pathname: string;
  onNavigate: () => void;
};