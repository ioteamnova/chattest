'use client'
import PostList from '../components/ui/PostList'
import Sidebar from '../components/ui/Sidebar'
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import FollowingBar from '@/components/FollowingBar';

export default async function HomePgae() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if(!user){
      redirect('/auth/singin');
  }
  
  return (
   <section className='flex flex-col md:flex-row max-w-[850px] p-4'>
   <div className='w-full basis-3/4 min-w-0'>
    <FollowingBar/>
    <PostList />
   </div>
  <div className='basis-1/4 ml-8'>
    <Sidebar user={user}/>
  </div>
  <div>
    </div>
   </section>
  )
}
