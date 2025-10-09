import React from 'react'
import SubmitIdeaForm from '../components/SubmitIdeaForm'

export default function SubmitPage(){
    return(
        <div className="p-3">
            <h2 className="text-lg font-semibold mb-3">Submit a new idea</h2>
            <SubmitIdeaForm/>
        </div>
    )
}