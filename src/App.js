import './App.css';
import { useState } from 'react';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [jsonData, setJsonData] = useState({
    blocks: []
  });

  const [draggingBlock, setDraggingBlock] = useState(null);
  const [draggingChild, setDraggingChild] = useState(null);
  const [resizingBlock, setResizingBlock] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizingHandle, setIsResizingHandle] = useState(false);
  const [toUpload, setToUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);


  const handleMouseDownChild = (e, blockId, childId) => {
    e.stopPropagation();
    setDraggingChild({ blockId, childId });
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMoveChild = (e) => {
    if (!draggingChild) return;
  
    const { blockId, childId } = draggingChild;
    const diffX = e.clientX - dragStart.x;
    const diffY = e.clientY - dragStart.y;
  
    setJsonData((prevData) => ({
      ...prevData,
      blocks: prevData.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              children: block.children.map((child) =>
                child.id === childId
                  ? {
                      ...child,
                      position: {
                        top: Math.max(
                          0,
                          Math.min(block.size.height - 50, child.position.top + diffY)
                        ),
                        left: Math.max(
                          0,
                          Math.min(block.size.width - 100, child.position.left + diffX)
                        )
                      }
                    }
                  : child
              )
            }
          : block
      )
    }));
  
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUpChild = () => {
    setDraggingChild(null);
  };

  
  const handleViewJson = () => {
    setIsVisible(!isVisible);
  };

  const handleAddNewBlock = () => {
    const newBlock = {
      id: `block_${jsonData.blocks.length + 1}`,
      type: "block",
      position: { top: 0, left: 0 },
      size: { height: 200, width: 300 },
      children: []
    };
    setJsonData(prevData => ({
      ...prevData,
      blocks: [...prevData.blocks, newBlock]
    }));
  };

  const handleMouseDownMove = (e, blockId) => {
    if (!isResizingHandle) {
      setDraggingBlock(blockId);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMoveMove = (e) => {
    if (!draggingBlock) return;
    const diffX = e.clientX - dragStart.x;
    const diffY = e.clientY - dragStart.y;
    setJsonData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block =>
        block.id === draggingBlock
          ? {
              ...block,
              position: {
                top: block.position.top + diffY,
                left: block.position.left + diffX
              }
            }
          : block
      )
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpMove = () => {
    setDraggingBlock(null);
  };

  const handleAddLabel = (blockId) => {
    const newLabel = {
      id: `text_${Date.now()}`,
      type: "text",
      content: "Add Text here",
      position: { top: 50, left: 50 },
      isEditing: false
    };
    setJsonData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block =>
        block.id === blockId
          ? { ...block, children: [...block.children, newLabel] }
          : block
      )
    }));
  };

  const handleAddImage = (blockId) => {
    const newImageId = `image_${Date.now()}`;
    setCurrentImageId(newImageId);
    const newImage = {
      id: newImageId,
      type: "image",
      position: { top: 120, left: 100 }
    };
    setJsonData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block =>
        block.id === blockId
          ? { ...block, children: [...block.children, newImage] }
          : block
      )
    }));
    setToUpload(true);
  };

  const handleEditText = (blockId, textId) => {
    setJsonData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block => ({
        ...block,
        children: block.children.map(child =>
          child.id === textId
            ? { ...child, isEditing: !child.isEditing }
            : child
        )
      }))
    }));
  };

  const handleChangeText = (e, blockId, textId) => {
    const newText = e.target.value;
    if (e.key === "Enter") {
      setJsonData(prevData => ({
        ...prevData,
        blocks: prevData.blocks.map(block => ({
          ...block,
          children: block.children.map(child =>
            child.id === textId
              ? { ...child, content: newText, isEditing: false }
              : child
          )
        }))
      }));
    } else {
      setJsonData(prevData => ({
        ...prevData,
        blocks: prevData.blocks.map(block => ({
          ...block,
          children: block.children.map(child =>
            child.id === textId
              ? { ...child, content: newText }
              : child
          )
        }))
      }));
    }
  };

  const handleMouseDownResize = (e, blockId) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingBlock(blockId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsResizingHandle(true);
  };

  const handleMouseMoveResize = (e) => {
    if (!resizingBlock) return;
    const diffX = e.clientX - dragStart.x;
    const diffY = e.clientY - dragStart.y;
    setJsonData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block =>
        block.id === resizingBlock
          ? {
              ...block,
              size: {
                width: Math.max(block.size.width + diffX, 50),
                height: Math.max(block.size.height + diffY, 50)
              }
            }
          : block
      )
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpResize = () => {
    setResizingBlock(null);
    setIsResizingHandle(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleUpload = () => {
    if (selectedFile && currentImageId) {
      const uploadedImagePath = URL.createObjectURL(selectedFile);
      setJsonData(prevData => ({
        ...prevData,
        blocks: prevData.blocks.map(block => ({
          ...block,
          children: block.children.map(child =>
            child.id === currentImageId
              ? { ...child, src: uploadedImagePath, width: 100, height: 50 }
              : child
          )
        }))
      }));
      setToUpload(false);
      setSelectedFile(null);
      setCurrentImageId(null);
    }
  };

  return (
    <div className="App">
      <div className="nav">
        <button className="btn" onClick={handleViewJson}>
          {isVisible ? 'Hide JSON' : 'View JSON'}
        </button>
      </div>
      <div
        className="container"
        onMouseMove={e => {
          handleMouseMoveMove(e);
          handleMouseMoveResize(e);
        }}
        onMouseUp={() => {
          handleMouseUpMove();
          handleMouseUpResize();
        }}
      >
        <div className="side-bar">
          <button className="btn" onClick={handleAddNewBlock}>
            Add New Block
          </button>

          {jsonData.blocks.map(block => (
            <div key={block.id} className="page-block">
              <div className="name-new-btns">
                <h3>{block.id}</h3>
                <button className="btn" onClick={() => handleAddImage(block.id)}>
                  Add Img
                </button>
                <button className="btn" onClick={() => handleAddLabel(block.id)}>
                  Add Label
                </button>
              </div>
              <div className="children">
                {block.children.map(child => (
                  <p key={child.id} className="child">{child.type}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="page">
          {jsonData.blocks.map(block => (
            <div
              key={block.id}
              className="block"
              style={{
                position: 'absolute',
                top: `${block.position.top}px`,
                left: `${block.position.left}px`,
                height: `${block.size.height}px`,
                width: `${block.size.width}px`,
                border: '1px solid black',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                cursor: resizingBlock ? 'se-resize' : 'move'
              }}
              onMouseMove={(e)=>handleMouseMoveChild(e)}
              onMouseUp={handleMouseUpChild}
              onMouseDown={(e) => handleMouseDownMove(e, block.id)}
            >
              {block.children.map(child => (
                <div
                  key={child.id}
                  style={{
                    position: 'absolute',
                    top: `${child.position.top}px`,
                    left: `${child.position.left}px`
                  }}
                >
                  {child.type === "text" && (
                    <div onClick={() => handleEditText(block.id, child.id)} 
                          onMouseDown={(e) => handleMouseDownChild(e, block.id, child.id)}  >
                      {child.isEditing ? (
                        <input
                          type="text"
                          value={child.content}
                          onChange={(e) => handleChangeText(e, block.id, child.id)}
                          onKeyDown={(e) => handleChangeText(e, block.id, child.id)}
                          autoFocus
                        />
                      ) : (
                        <p>{child.content}</p>
                      )}
                    </div>
                  )}
                  {child.type === "image" && (
                    <img src={child.src} alt={child.id} width={child.width} height={child.height} 
  onMouseDown={(e) => handleMouseDownChild(e, block.id, child.id)} />
                  )}
                </div>
              ))}
              <div
                className="resize-handle"
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'blue',
                  cursor: 'se-resize'
                }}
                onMouseDown={(e) => handleMouseDownResize(e, block.id)}
                title="Resize"
              ></div>
            </div>
          ))}
        </div>
      </div>

      {isVisible && (
        <div className="json-container">
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}

      {toUpload && (
        <div className="img-upload-container">
          <input type="file" onChange={handleFileChange} />
          <button className="btn" onClick={handleUpload}>
            Upload
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
