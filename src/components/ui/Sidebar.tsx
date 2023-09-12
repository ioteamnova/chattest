import { User } from "@/app/model/user";
import Avatar from "../Avatar";

type Props = {
    user: User
}

export default function Sidebar({user: {name, email, image, username}}:Props){
    return <>
    <div className="flex items-center">
        {image && <Avatar image={image} highlight/>}
        <div className="ml-4">
            <p className="font-bold">{username}</p>
            <p className="text-lg text-neutral-500 leading-4">{name}</p>
        </div>
    </div>
    <p className="text-sm text-neutral-500 mt-8">
        About  Help Press API
    </p>
    <p className="font-bold text-sm mt-8">
        @Copyright INSTAGRAM from METAL
    </p>
    </>
}