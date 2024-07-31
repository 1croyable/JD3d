import axios from "axios";

function getfiles(name, folders, cb) {
    try {
        axios.get(`/api/getfiles`, {
            params: {
                name: name,
                folders: JSON.stringify(folders)
            }
        }).then((response) => {
            return cb(response.data);
        })
    }
    catch (err) {
        alert(err);
    }
}

export default getfiles