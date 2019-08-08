import React, { FC, useCallback, useEffect, useState } from 'react';
import uuid from 'uuid4';
import { INode, IFileWithUUID, IFile } from '~/redux/types';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { connect } from 'react-redux';
import { selectUploads } from '~/redux/uploads/selectors';
import assocPath from 'ramda/es/assocPath';
import append from 'ramda/es/append';
import { ImageGrid } from '~/components/editors/ImageGrid';

const mapStateToProps = selectUploads;
const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {
  data: INode;
  setData: (val: INode) => void;
}



const ImageEditorUnconnected: FC<IProps> = ({ data, setData, uploadUploadFiles, statuses, files }) => {
  const eventPreventer = useCallback(event => event.preventDefault(), []);
  const [temp, setTemp] = useState([]);

  const onFileAdd = useCallback((file: IFile) => {
    setData(assocPath(['files'], append(file, data.files), data));
  }, [data, setData]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.dataTransfer.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: 'editor'
        })
      );

      const temps = items.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, temp]
  );

  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.target.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: 'editor'
        })
      );

      const temps = items.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, temp]
  );

  useEffect(() => {
    window.addEventListener('dragover', eventPreventer, false);
    window.addEventListener('drop', eventPreventer, false);

    return () => {
      window.removeEventListener('dragover', eventPreventer, false);
      window.removeEventListener('drop', eventPreventer, false);
    };
  }, [eventPreventer]);

  useEffect(() => console.log({ temp }), [temp]);
  useEffect(() => console.log({ data }), [data]);

  useEffect(() => {
    console.log({ temp, files });

    Object.entries(statuses).forEach(([id, status]) => {
      // todo: make this working
      console.log({ id, uuid: status.uuid, file: files[status.uuid], files });

      if (temp.includes(id) && !!status.uuid && files[status.uuid]) {
        console.log(`${id} uploaded`);
        onFileAdd(files[status.uuid]);
        setTemp(temp.filter(el => el !== id));
      }
    });
  }, [statuses, files]);

  return (
    <ImageGrid
      items={data.files}
      locked={temp.map(id => statuses[id])}
    />
  );
};

const ImageEditor = connect(mapStateToProps, mapDispatchToProps)(ImageEditorUnconnected)
export { ImageEditor };

/*

<SortableList onSortEnd={console.log} axis="xy">
      {
        data.files.map(file => (
          <ImageUpload
            thumb={file.url}
          />
        ))
      }
    </SortableList>

  <form className={styles.uploads} onDrop={onDrop}>
  {
    temp.map(id => (
      statuses[id] && (
        <ImageUpload
          thumb={statuses[id].preview}
          progress={statuses[id].progress}
          is_uploading
        />
      )
    ))
  }

  {
        temp.map(id => (
          statuses[id] && (
            <ImageUpload
              thumb={statuses[id].preview}
              progress={statuses[id].progress}
              is_uploading
            />
          )
        ))
      }
  <input type="file" onChange={onInputChange} accept="image/*" multiple />
</form>
*/