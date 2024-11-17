import { useState } from "react"


function TabCard(props) {
    return (
        <button
            className='RG_ENTITY_CARD'
            onClick={(event) => {
                console.log("PAGE:")
                console.log(props.tab)
                // TODO change context
            }}
        >
            {props.tab.name}
        </button>
    )
}

function PageBase(props) {
    const [tabs, setTabs] = useState(props.context.page.page_settings)

    return (
        <div>
            <div style={{...props.style}} className="RG_ENTITYCARD_BG">
                {tabs.map(tab => {
                    return (
                    <TabCard
                        key={tab.uid}
                        tab={tab}
                        schema={"pages"}
                        setcontext={props.setcontext}
                    />
                )})}
            </div>
        </div>
    )
}


export {PageBase};
