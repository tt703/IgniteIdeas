import React from 'react'
import SubmitIdeaForm from '../components/SubmitIdeaForm'

export default function SubmitPage(){
    return(
        <div className="p-3">
            <h2 className="text-lg font-bold mb-3">Submit New Idea Form</h2>
            <SubmitIdeaForm/>
        </div>
    )
}