import axios from 'axios';

async function getFileContent(cosKey) {
    return axios.get(`/api/getFileContent?cosKey=${cosKey}`)
        .then((response) => {
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to fetch file content');
            }
        });
}

export default getFileContent;
