import React, { use } from 'react'
import { useNavigate } from 'react-router-dom'
import {FaPlus} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

export default function AddIdeaButton() {
    const nav = useNavigate()
    const { user } = useAuth()
    return(
        <div className="fixed right-5 bottom-20 z-40">
            <button onClick={() => user ? nav('/') : nav('/login')} className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600">
                <FaPlus/>
            </button>
        </div>
    )
}