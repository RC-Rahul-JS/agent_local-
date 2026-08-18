import axios from 'axios';
import { useLoader } from '../loader/LoaderContext';

const UploadFile = async (photo) => {

    try {
        const formData = new FormData();
        formData.append("file", photo);

        const response = await axios.post(
            'https://api.duniyamart.duniyape.in/upload-doc/I89nD59Ra69j0ee512TsW143eEt03u',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        const photolink = response.data.link;
        console.log("Done")
        return photolink;

    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
};

export default UploadFile;
