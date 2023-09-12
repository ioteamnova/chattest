'use client'
import { DetailUser } from '@/app/model/user';
import Link from 'next/link';
import { PropagateLoader } from 'react-spinners';
import useSWR from 'swr';
import Avatar from './Avatar';
import ScrollableBar from './ScrollableBar';

export default function FollowingBar(){
    // const {data, isLoading: loading, error} = useSWR<DetailUser>('http://localhost:3001/boards/api/home');
    // const {data, isLoading: loading, error} = null;
    // //const users = data?.following;
    // const users = data?.following && [
    //     ...data?.following,
    //     ...data?.following,
    //     ...data?.following,
    //   ];
    
      
    return <section className='w-full flex justify-center items-center p-4 shadow-sm shadow-neutral-300 mb-4 rounded-lg min-h-[90px] overflow-x-auto'>
        {/* { loading? <PropagateLoader size={8}  color='red' /> : (!users || users.length === 0) && <p>{`팔로워가 없습니다.`}</p>}
        {
            users && users.length > 0  && (
                <ScrollableBar>
                  {users.map(({ image, username }) => (
                    <Link
                      key={username}
                      className='flex flex-col items-center w-20'
                      href={`/user/${username}`}
                    >
                      <Avatar image={image} highlight />
                      <p className='w-full text-sm text-center text-ellipsis overflow-hidden'>
                        {username}
                      </p>
                    </Link>
                  ))}
                </ScrollableBar>
              )
        } */}
    </section>;
}