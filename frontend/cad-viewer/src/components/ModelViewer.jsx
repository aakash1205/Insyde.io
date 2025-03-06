import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import * as THREE from "three";

const Model = ({ modelUrl, format, onExport }) => {
    const groupRef = useRef();
    const { camera } = useThree();
    const geometry = useLoader(format === "stl" ? STLLoader : OBJLoader, modelUrl);
    const [exportableMesh, setExportableMesh] = useState(null);

    useEffect(() => {
        if (geometry) {
            console.log(`✅ ${format.toUpperCase()} Model loaded successfully!`);
            const material = new THREE.MeshStandardMaterial({ color: "white", roughness: 0.2, metalness: 0.9 });

            let mesh;
            if (format === "stl") {
                mesh = new THREE.Mesh(geometry, material);
            } else {
                mesh = geometry;
                mesh.traverse((child) => {
                    if (child.isMesh) child.material = material;
                });
            }

            setExportableMesh(mesh);

            const boundingBox = new THREE.Box3().setFromObject(mesh);
            const center = boundingBox.getCenter(new THREE.Vector3());
            const size = boundingBox.getSize(new THREE.Vector3());

            if (groupRef.current) {
                groupRef.current.position.set(-center.x, -center.y, -center.z);
            }

            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(0, 0, maxDim * 3);
            camera.lookAt(0, 0, 0);
        }
    }, [geometry, camera, format]);

    useEffect(() => {
        if (exportableMesh) {
            onExport(exportableMesh);
        }
    }, [exportableMesh, onExport]);

    return (
        <group ref={groupRef}>
            {format === "stl" ? (
                <mesh geometry={geometry} />
            ) : (
                <primitive object={geometry} />
            )}
        </group>
    );
};

const ModelViewer = ({ modelUrl }) => {
    if (!modelUrl) {
        console.error("❌ Model URL is undefined!");
        return null;
    }
    const format = modelUrl.split(".").pop()?.toLowerCase();
    const [exportMesh, setExportMesh] = useState(null);

    const exportToOBJ = () => {
        if (!exportMesh) {
            console.error("❌ No model available for export!");
            return;
        }

        try {
            const exporter = new OBJExporter();
            const result = exporter.parse(exportMesh);

            const blob = new Blob([result], { type: "text/plain" });
            const objUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = objUrl;
            link.download = "exported_model.obj";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("✅ Exported successfully!");
        } catch (error) {
            console.error("❌ Error exporting OBJ:", error);
        }
    };

    return (
        <div style={viewerContainerStyle}>
            <div style={canvasContainerStyle}>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                    <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} />
                    <Environment preset="city" />
                    <OrbitControls enableDamping dampingFactor={0.1} autoRotate autoRotateSpeed={1} />
                    <Model modelUrl={modelUrl} format={format} onExport={setExportMesh} />
                </Canvas>
            </div>
            <button onClick={exportToOBJ} style={exportButtonStyle}>
                Export to OBJ
            </button>
        </div>
    );
};

const viewerContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#222",
    position: "relative",
};

const canvasContainerStyle = {
    width: "80vw",
    height: "80vh",
    maxWidth: "800px",
    maxHeight: "600px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
};

const exportButtonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "#FFD700",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s",
};

export default ModelViewer;
