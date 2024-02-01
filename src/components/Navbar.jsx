"use client";

import React, { useState } from "react";
import Link from "next/link";
import SignIn from "./signin";
import { ConnectKitButton } from "connectkit";

export default function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [flyer, setFlyer] = useState(false);
  const [flyerTwo, setFlyerTwo] = useState(false);

  return (
    <header class="fixed top-0 w-full clearNav z-50">
      <div class="max-w-5xl mx-auto flex flex-wrap p-5 flex-col md:flex-row">
        <div className="flex flex-row items-center justify-between p-3 md:p-1">
          <Link
            href="/"
            class="flex text-3xl text-white font-medium mb-4 md:mb-0 "
          >
            BankWim
          </Link>

          <button
            className="text-white pb-4 cursor-pointer leading-none px-3 py-1 md:hidden outline-none focus:outline-none content-end ml-auto"
            type="button"
            aria-label="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-menu"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <div
          className={
            "md:flex flex-grow items-center" +
            (navbarOpen ? " flex" : " hidden")
          }
        >
          <div class="md:ml-auto md:mr-auto font-4 pt-1 md:pl-14 pl-1 flex flex-wrap items-center md:text-base text-1xl md:justify-center justify-items-start">
            <Link
              class="mr-12 md:ml-18 ml-0 cursor-pointer text-gray-300 hover:text-white hover:text-lg font-semibold tr04"
              href="/collateral"
            >
              Collateral
            </Link>
            <Link
              class="mr-12 md:ml-18 ml-0 cursor-pointer text-gray-300 hover:text-white hover:text-lg font-semibold tr04"
              href="/lending"
            >
              Lending
            </Link>
            <Link
              class="mr-12 md:ml-18 ml-0 cursor-pointer text-gray-300 hover:text-white hover:text-lg font-semibold tr04"
              href="/dao"
            >
              DAO
            </Link>

            <Link
              class="mr-12 md:ml-18 ml-0 cursor-pointer text-gray-300 hover:text-white hover:text-lg font-semibold tr04"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </div>

          {/* <ConnectKitButton /> */}
          <SignIn />
        </div>
      </div>
    </header>
  );
}
