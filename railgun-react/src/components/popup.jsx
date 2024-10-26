import './popup.css'



function hideSelf(displaySelf) {
    displaySelf(false)
}


function Popup(props) {
    // Expects 
    // Message to display
    // State setter for displaying itself
    // Callback on user > Accept
    return (
        <div className='RG_POPUP_WINDOW'>
            <div className='RG_POPUP_TEXT RG_POPUP_CHUNK'>
                {props.message}
            </div>
            <div name="applyChunk" className='RG_POPUP_APPLY_CHUNK RG_POPUP_CHUNK'>
                    <button 
                        className='RG_SUBTLE_BUTTON'
                        type="button"
                        onClick={() => hideSelf(props.displaySelf)}
                    >
                        Cancel
                    </button>
                    <button
                        className="RG_HIGHLIGHT_BUTTON"
                        type="button"
                        onClick={() => props.callback()}  // make sure 'event' isn't sent to the callback to mess up params
                    >
                        OK
                    </button>
                </div>
        </div>
    )
}

export {Popup};
