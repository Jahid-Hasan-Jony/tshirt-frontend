import { useCallback, useEffect, useRef, useState } from "react";

const fabric = window.fabric;

const MessageModal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center font-inter animate-fade-in">
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md"
        >
          OK
        </button>
      </div>
    </div>
  );
};

function Home() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [tshirtColor, setTshirtColor] = useState("white");
  const [canvasReady, setCanvasReady] = useState(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("tshirt");
  const [selectedSize, setSelectedSize] = useState("M");
  const [modalMessage, setModalMessage] = useState("");
  const backgroundImageRef = useRef(null);

  const categoryOptions = ["tshirt", "hoodie", "polo-tshirt"];
  const colorOptions = ["white", "black", "red"];

  const updateTshirtImage = useCallback(() => {
    if (!canvasReady || !canvas) return;
    const imagePath = `/tshirt/${selectedCategory}/${tshirtColor}.png`;

    fabric.Image.fromURL(
      imagePath,
      (img) => {
        img.set({
          selectable: false,
          evented: false,
          hasBorders: false,
          hasControls: false,
          hoverCursor: "default",
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
          scaleX: canvas.getWidth() / img.width,
          scaleY: canvas.getHeight() / img.height,
        });

        if (backgroundImageRef.current) {
          canvas.remove(backgroundImageRef.current);
        }
        canvas.insertAt(img, 0, false);
        backgroundImageRef.current = img;
        canvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  }, [canvas, canvasReady, selectedCategory, tshirtColor]);

  useEffect(() => {
    if (!fabric) {
      console.error("Fabric.js not loaded.");
      setModalMessage("Error: Fabric.js could not be loaded.");
      setIsCanvasLoading(false);
      return;
    }

    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        backgroundColor: null,
        selection: true,
        preserveObjectStacking: true,
      });

      fabricCanvas.selection = true;

      setCanvas(fabricCanvas);
      setCanvasReady(true);
      setIsCanvasLoading(false);

      return () => {
        fabricCanvas.dispose();
        setCanvasReady(false);
        setIsCanvasLoading(true);
      };
    }
  }, []);

  useEffect(() => {
    updateTshirtImage();
  }, [updateTshirtImage]);

  const addText = useCallback(() => {
    if (!canvasReady || !canvas) {
      setModalMessage("Please wait, the design canvas is still loading.");
      return;
    }

    const text = new fabric.Textbox("Your Design Text", {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: "center",
      originY: "center",
      fontSize: 30,
      fill: "#000000",
      fontFamily: "Inter",
      editable: true,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTimeout(() => {
      text.enterEditing();
      text.hiddenTextarea && text.hiddenTextarea.focus();
    }, 100);
  }, [canvas, canvasReady]);

  const handleImageUpload = useCallback(
    (e) => {
      if (!canvasReady || !canvas) {
        setModalMessage("Please wait, the design canvas is still loading.");
        return;
      }
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (f) {
        const data = f.target.result;
        fabric.Image.fromURL(
          data,
          (img) => {
            const maxWidth = canvas.getWidth() * 0.8;
            const maxHeight = canvas.getHeight() * 0.8;
            let scale = 1;
            if (img.width > maxWidth || img.height > maxHeight) {
              scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            }

            img.set({
              left: canvas.getWidth() / 2,
              top: canvas.getHeight() / 2,
              originX: "center",
              originY: "center",
              scaleX: scale,
              scaleY: scale,
              selectable: true,
              evented: true,
              hasControls: true,
              hasBorders: true,
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          },
          { crossOrigin: "anonymous" }
        );
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [canvas, canvasReady]
  );

  const deleteSelectedObject = useCallback(() => {
    if (!canvasReady || !canvas) {
      setModalMessage("Please wait, the design canvas is still loading.");
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (activeObject && !activeObject.isEditing) {
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [canvas, canvasReady]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        canvasReady &&
        canvas
      ) {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.isEditing) return;
        e.preventDefault();
        deleteSelectedObject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedObject, canvasReady, canvas]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100">
      <h1 className="text-4xl font-bold mb-4 text-indigo-800">
        🧵 T-Shirt Designer
      </h1>

      <div className="flex gap-4 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={tshirtColor}
          onChange={(e) => setTshirtColor(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          {colorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        <button
          onClick={addText}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Add Text
        </button>

        <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
        </label>

        <button
          onClick={deleteSelectedObject}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>

      <div className="border border-gray-300 bg-white shadow-md rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          id="designCanvas"
          className="block w-[400px] h-[500px] z-10"
          style={{ touchAction: "none" }}
        />
      </div>

      <MessageModal
        message={modalMessage}
        onClose={() => setModalMessage("")}
      />
    </div>
  );
}

export default Home;
