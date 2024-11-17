const RG_URL = import.meta.env.RG_BACKEND_URL
const RG_DISCHARGE = RG_URL+"/discharge/"


async function _makeRGCall(endpoint, body, method){
    let response = await fetch(`${RG_URL}/${endpoint}`, {
        mode:"cors",
        method: method || "POST",
        body: body,
        credentials: "include"
    })
    if ([401, 405].includes(response.status)){
        // Auth failure, redirect to login
        location.href = "/login"
        return  // Who cares
    }
    return response
}


async function login(creds) {
    console.log("Attempting to log in")
    console.log(creds)
    let login_response = await fetch(RG_URL+"/login", {
        mode:"cors",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        method: "POST",
        body: `grant_type=password&username=${creds.get("username")}&password=${creds.get("password")}`,
        credentials: "include"
    })
    if (!login_response.ok){
        console.log("returning false")
        return false
    }

    return true
}


async function telescope(schema, entity) {
    let response = await _makeRGCall(
        "telescope",
        JSON.stringify(entity ? {schema: schema, entity:entity} : {schema: schema})
    )
    return await response.json()
}


async function fetchRGData(schema, entity_type, fields, filters=null, page=1, include_count=true) {
    let fetch_data = {
        "schema": schema,
        "entity": entity_type,
        "read": {
                "filters": filters ? filters : null,
                "return_fields": fields,
                "page": page,
                "pagination": 100,
                "include_count": include_count
        }
    }
    let response = await _makeRGCall(
        "read",
        JSON.stringify(fetch_data)
    )
    return await response.json()
}


async function createRGData(CREATE_REQUEST){
    let response = await _makeRGCall(
        "create",
        JSON.stringify(CREATE_REQUEST),
    )
    if (response.ok) {
        console.log("CREATED!!!!")
        return true
    } else {
        console.error(response)
        return false
    }
}


async function updateRGData(UPDATE_REQUEST){
    let response = await _makeRGCall(
        "update",
        JSON.stringify(UPDATE_REQUEST)
    )
    if (response.ok) {
        console.log("UPDATED!!!!")
        return true
    } else {
        console.log(response)
        return false
    }
}


async function batchRGData(batchData){
    // TODO possiblt change return behavior here
    let response = await _makeRGCall(
        "batch",
        JSON.stringify(batchData),
    )
    if (response.ok) {
        return true
    } else {
        console.error(response)
        return false
    }
}

////////////////////////////////////////////////////////////
// STELLAR functions are a bunch of dupes, for clarity... //
////////////////////////////////////////////////////////////
async function createRGField(CREATE_REQUEST) {
    let response = await _makeRGCall(
        "stellar",
        JSON.stringify(CREATE_REQUEST),
    )
    if (response.ok) {
        console.log("CREATED!!!!")
        return true
    } else {
        console.error(response)
        return false
    }
}

async function deleteRGField(DELETE_REQUEST) {
    let response = await _makeRGCall(
        "stellar",
        JSON.stringify(DELETE_REQUEST),
    )
    if (response.ok) {
        console.log("CREATED!!!!")
        return true
    } else {
        console.error(response)
        return false
    }
}



async function createRGEntity(CREATE_REQUEST) {
    let response = await _makeRGCall(
        "stellar",
        JSON.stringify(CREATE_REQUEST),
    )
    if (response.ok) {
        console.log("CREATED!!!!")
        return true
    } else {
        console.error(response)
        return false
    }
}

async function deleteRGEntity(DELETE_REQUEST) {
    let response = await _makeRGCall(
        "stellar",
        JSON.stringify(DELETE_REQUEST),
    )
    if (response.ok) {
        console.log("DELETED!!!!")
        return true
    } else {
        console.error(response)
        return false
    }
}


async function uploadRGData(file, metadata) {
    let form = new FormData()
    form.set("metadata", metadata)
    form.set("file", file)
    console.log(form)
    let response = await _makeRGCall(
        "upload",
        form
    )
    if (response.ok) {
        console.log("UPLOADED!!!!!!")
        return await response.json()
    } else {
        console.err(response)
    }
}


async function downloadRGData(path, src=null) {
    let response = await _makeRGCall(
        "download",
        JSON.stringify({"path": path})
    )
    if (response.ok){
        // We may pass a state setter... HACK
        if (src) {
            src(await response.blob())
            return
        } else {
            return await response.blob()
        }
    } else {
        console.error(response)
        return ""
    }
}



async function fetchAutocompleteOptions(fieldConstraints, input, STELLAR) {
    let allOptions = []
    await Promise.all(Object.keys(fieldConstraints).map(async (possibleType) => {
        let fetchData = {
            "schema": STELLAR.code,
            "entity": possibleType,
            "read": {
                "return_fields": [STELLAR.entities[possibleType].display_name_col],
                "filters": {  // TODO this filter should be defined in the params of the multi/entity field(s)
                    "filter_operator": "AND",
                    "filters": [
                                [STELLAR.entities[possibleType].display_name_col, "starts_with", input],
                            ]
                },
                "pagination": 10
            }
        }
        let response = await _makeRGCall(
            "read",
            JSON.stringify(fetchData)
        )
        if (!response.ok) {
            return  // This possibleEntity will not be displayed.
        }
        response = await response.json()
        let theseOptions = response.map(ent => {
            return {label: ent[STELLAR.entities[possibleType].display_name_col], value: JSON.stringify(ent)}
        })
        allOptions = allOptions.concat(theseOptions)
    }))
    return allOptions
}


export {
    RG_URL, RG_DISCHARGE,
    telescope, fetchRGData,
    createRGData, updateRGData, batchRGData,
    createRGField, deleteRGField,
    createRGEntity, deleteRGEntity,
    uploadRGData, downloadRGData,
    fetchAutocompleteOptions, login
};
