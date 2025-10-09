import React from 'react'
import { Link } from 'react-router-dom'
import {FaThumbsUp, FaComments} from 'react-icons/fa'

export default function IdeaCard({idea,onLike}) {
    return(
        <article  className="bg-white p-4 rounded-lg shadow-sm">
            <Link to={`/ideas/${idea.id}`}>
               <h3 className="font-semibold">{idea.title}</h3>
               <p className="text-sm text-gray-600 max-h-[3rem] overflow-hidden mt-2">{idea.description}</p>
            </Link>
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <button onClick={() => onLike(idea.id)} className="flex items-center gap-1 hover:text-orange-500">
                        <FaThumbsUp/>
                        <span>{idea.votes ?? 0}</span>
                    </button>
                    <div className="flex items-center gap-1">
                        <FaComments/>
                        <span>{idea.comments_count ?? 0}</span>
                    </div>
                </div>
                <div className='text-xs text-gray-400'>{new Date(idea.created_at).toLocaleDateString()}</div>
            </div>
        </article>
    )
}