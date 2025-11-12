"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronDown,
  CreditCard,
  FileText,
  LogOut,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = () => {
    if (user.ownerName) {
      return user.ownerName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.shopName) {
      return user.shopName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.phone.slice(-2);
  };

  const getStatusBadge = () => {
    if (user.isApproved) {
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-green-100 text-green-800"
        >
          Approved
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-yellow-100 text-yellow-800"
      >
        Pending
      </Badge>
    );
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto p-2 min-w-10"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium leading-none">
              {user.ownerName || user.shopName || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {user.shopName && user.ownerName ? user.shopName : user.phone}
            </span>
          </div>
          <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" sideOffset={5}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {user.ownerName || "Shop Owner"}
              </p>
              {getStatusBadge()}
            </div>
            <div className="flex flex-col space-y-1">
              {user.shopName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  {user.shopName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{user.phone}</p>
              {user.customerTier && (
                <p className="text-xs text-muted-foreground">
                  {user.customerTier.toUpperCase()} Tier
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard */}
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        {/* Profile */}
        {user.userTypes === "admin" && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Orders */}
        <DropdownMenuItem asChild>
          <Link
            href="/my-orders"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>

        {/* Wallet */}
        <DropdownMenuItem asChild>
          <Link
            href="/wallet"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span>Wallet</span>
            {user.availableCredit !== undefined && (
              <span className="ml-auto text-xs text-green-600">
                ₹{user.availableCredit.toLocaleString()}
              </span>
            )}
          </Link>
        </DropdownMenuItem>

        {/* Documents */}
        <DropdownMenuItem asChild>
          <Link
            href="/profile?tab=documents"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Documents</span>
            {(!user.aadhaarPhoto || !user.panCardPhoto) && (
              <Badge variant="destructive" className="ml-auto text-xs">
                !
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
