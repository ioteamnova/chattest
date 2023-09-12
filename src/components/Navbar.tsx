'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from 'next-auth/react';
import Avatar from "./Avatar";
import ReactHlsPlayer from 'react-hls-player';
import React from 'react';
import { useEffect, useRef } from "react";
import HomeFillIcon from "./ui/icons/HomeFillIcon";
import SearchIcon from "./ui/icons/SearchIcon";
import SearchFillIcon from "./ui/icons/SearchFillIcon";
import NewIcon from "./ui/icons/NewIcon";
import NewFillIcon from "./ui/icons/NewFillIcon";
import HomeIcon from "./ui/icons/HomeIcon";
import ColorButton from "./ui/ColorButton";

interface IMessage {
  user: string;
  message: string;
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathName = usePathname();
  const user = session?.user;
  const playerRef = React.useRef();
  const videoSrc = 'https://reptimate.s3.ap-northeast-2.amazonaws.com/test/20230627191738-22cce424-56a0-4f89-a9cb-ba259c13642b-test.jpg';

  const menu = [
    {
      href: '/',
      icon: <HomeIcon />,
      clickedIcon: <HomeFillIcon />
    },
    {
      href: '/search',
      icon: <SearchIcon />,
      clickedIcon: <SearchFillIcon />
    },
    {
      href: '/new',
      icon: <NewIcon />,
      clickedIcon: <NewFillIcon />
    }
  ];

  return (
    <div className="flex justify-between items-center px-6">
      <Link href={'/'}>
        <h1 className="text-3l font-bold">Reptimate</h1>
      </Link>
      <nav>
        <ul className='flex gap-4 items-center p-4'>
          {
            menu.map(item => (
              <li key={item.href}>
                <Link href={item.href}>
                  {pathName === item.href ? item.clickedIcon : item.icon}
                </Link>
              </li>
            ))
          }
          <li>
            <Link href={`/user/${user?.username || ''}`}>
              {user && <Avatar image={user.image} size='small' highlight />}
            </Link>
          </li>
          <li>
            {session ? (
              <ColorButton text='Sign out' size='small' onClick={() => signOut()} />
            ) : (
              <ColorButton text='Sign in' size='small' onClick={() => signIn()} />
            )}
          </li>
        </ul>
      </nav>
      {/* <ReactHlsPlayer
        src={videoSrc}
        autoPlay={false}
        controls={true}
        width="100%"
        height="auto"
        hlsConfig={{
          debug: false, // Enable debug logging
          enableWorker: true // Enable the worker for performance optimization
        }}
        playerRef={playerRef}
      /> */}
      {/* <img alt='user profile' src={videoSrc}
        referrerPolicy="no-referrer"/> */}
    </div>
  );
}