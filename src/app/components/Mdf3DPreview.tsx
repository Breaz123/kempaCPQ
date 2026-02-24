/**
 * 3D MDF Preview Component
 * 
 * Interactive 3D preview of MDF board with rotation and scaling capabilities.
 */

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { CoatingSide, MdfStructure } from '../../slices/configuration';
import type { DrillPosition } from '../../slices/configuration/models/DrillPosition';
import * as THREE from 'three';

// Texture images for the 4 MDF structuren.
// Let op: deze paden gaan ervan uit dat de bestanden in de map
// "Foto's" in de projectroot staan met exact deze bestandsnamen.
import lineTextureUrl from "../../../Foto's/Line.jpg";
import stoneTextureUrl from "../../../Foto's/Stone.jpg";
import leatherTextureUrl from "../../../Foto's/Leather.jpg";
import linenTextureUrl from "../../../Foto's/Linen.jpg";

interface Mdf3DPreviewProps {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  coatingSides: CoatingSide[];
  selectedColor?: string;
  drillPositions?: DrillPosition[];
  structure?: MdfStructure;
}

// MDF Board component
function MdfBoard({ 
  lengthMm, 
  widthMm, 
  heightMm, 
  coatingSides,
  selectedColor = '#FF6B6B',
  drillPositions = [],
  structure,
}: Mdf3DPreviewProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert mm to 3D units (scale down for visualization)
  // All dimensions use the same scale for accurate proportions
  const baseScale = 0.01; // 1mm = 0.01 units in 3D
  const length = lengthMm * baseScale;
  const width = widthMm * baseScale;
  const height = heightMm * baseScale; // Same scale as length and width

  // Laad de structuurfoto's als textures.
  const textures = useTexture({
    [MdfStructure.Line]: lineTextureUrl,
    [MdfStructure.Stone]: stoneTextureUrl,
    [MdfStructure.Leather]: leatherTextureUrl,
    [MdfStructure.Linen]: linenTextureUrl,
  });

  const surfaceTexture = structure ? textures[structure] : undefined;

  // Powder coating: always use the selected color for all sides
  // The entire board is powder coated with the same color
  const getSideColor = (): string => {
    return selectedColor;
  };

  // Powder coating material properties per Kempa-structuur.
  // We vermijden hier bewust hoge glans (geen clearcoat) en gebruiken de structuur
  // om de ruwheid en lichtreflectie te bepalen.
  const baseMaterial = (() => {
    switch (structure) {
      case MdfStructure.Stone:
        return {
          roughness: 0.9,      // sterk matte, korrelige look
          clearcoat: 0.0,
          clearcoatRoughness: 1.0,
          envMapIntensity: 0.25,
          bumpScale: 0.35,
        };
      case MdfStructure.Leather:
        return {
          roughness: 0.8,      // zacht, licht diffuus
          clearcoat: 0.0,
          clearcoatRoughness: 1.0,
          envMapIntensity: 0.3,
          bumpScale: 0.25,
        };
      case MdfStructure.Linen:
        return {
          roughness: 0.85,     // fijne textuur, weinig glans
          clearcoat: 0.0,
          clearcoatRoughness: 1.0,
          envMapIntensity: 0.25,
          bumpScale: 0.2,
        };
      case MdfStructure.Line:
      default:
        return {
          roughness: 0.75,     // iets strakker maar nog steeds mat
          clearcoat: 0.0,
          clearcoatRoughness: 1.0,
          envMapIntensity: 0.3,
          bumpScale: 0.3,
        };
    }
  })();

  const powderCoatMaterial = {
    color: selectedColor,
    metalness: 0.0, // Non-metallic powder coating
    ...baseMaterial,
  };

  return (
    <group>
      {/* Main MDF board with powder coating - high-end finish */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[length, height, width]} />
        <meshPhysicalMaterial 
          color={powderCoatMaterial.color}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>
      
      {/* Overlay planes for each side with powder coating finish */}
      {/* Front */}
      <mesh position={[0, 0, width / 2 + 0.001]}>
        <planeGeometry args={[length, height]} />
        <meshPhysicalMaterial 
          color={getSideColor()}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>

      {/* Back */}
      <mesh position={[0, 0, -width / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[length, height]} />
        <meshPhysicalMaterial 
          color={getSideColor()}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>

      {/* Top */}
      <mesh position={[0, height / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshPhysicalMaterial 
          color={getSideColor()}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>

      {/* Bottom */}
      <mesh position={[0, -height / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshPhysicalMaterial 
          color={getSideColor()}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>

      {/* Left */}
      <mesh position={[-length / 2 - 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial 
          color={getSideColor()}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>

      {/* Right */}
      <mesh position={[length / 2 + 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial 
          color={getSideColor()}
          bumpMap={surfaceTexture}
          bumpScale={powderCoatMaterial.bumpScale}
          roughness={powderCoatMaterial.roughness}
          metalness={powderCoatMaterial.metalness}
          clearcoat={powderCoatMaterial.clearcoat}
          clearcoatRoughness={powderCoatMaterial.clearcoatRoughness}
          envMapIntensity={powderCoatMaterial.envMapIntensity}
        />
      </mesh>
      
      {/* Drill holes - visible as dark circles on the surface */}
      {drillPositions.map((drill) => {
        // Make holes MUCH more visible - use 20mm diameter minimum
        const diameterMm = Math.max(drill.diameterMm || 20, 20);
        const radius = (diameterMm * baseScale) / 2;
        
        // Convert cm to mm, then to 3D units
        // pos1 = distance from short side, pos2 = distance from long side
        const pos1Mm = drill.position1Cm * 10; // cm to mm
        const pos2Mm = drill.position2Cm * 10; // cm to mm
        const pos1 = pos1Mm * baseScale;
        const pos2 = pos2Mm * baseScale;
        
        // Calculate position based on which side
        // Coordinate system: center is (0,0,0), board extends from -length/2 to +length/2 (x), etc.
        // Overlay planes are at: Front z=width/2+0.001, Back z=-width/2-0.001, etc.
        // Holes must be rendered ABOVE the overlay planes to be visible
        let position: [number, number, number] = [0, 0, 0];
        let rotation: [number, number, number] = [0, 0, 0];
        const offset = 0.005; // Offset to render holes above overlay planes
        
        switch (drill.side) {
          case CoatingSide.Front:
            // Front face: short side = height (y), long side = length (x)
            // pos1 = from short side (top edge, y), pos2 = from long side (left edge, x)
            // Front overlay is at z = width/2 + 0.001, so hole at z = width/2 + 0.001 + offset
            position = [-length / 2 + pos2, height / 2 - pos1, width / 2 + 0.001 + offset];
            rotation = [0, 0, 0];
            break;
          case CoatingSide.Back:
            // Back face: short side = height (y), long side = length (x)
            // Back overlay is at z = -width/2 - 0.001, so hole at z = -width/2 - 0.001 - offset
            position = [length / 2 - pos2, height / 2 - pos1, -width / 2 - 0.001 - offset];
            rotation = [0, Math.PI, 0];
            break;
          case CoatingSide.Top:
            // Top face: short side = width (z), long side = length (x)
            // Top overlay is at y = height/2 + 0.001, so hole at y = height/2 + 0.001 + offset
            position = [-length / 2 + pos2, height / 2 + 0.001 + offset, width / 2 - pos1];
            rotation = [-Math.PI / 2, 0, 0];
            break;
          case CoatingSide.Bottom:
            // Bottom overlay is at y = -height/2 - 0.001, so hole at y = -height/2 - 0.001 - offset
            position = [-length / 2 + pos2, -height / 2 - 0.001 - offset, width / 2 - pos1];
            rotation = [Math.PI / 2, 0, 0];
            break;
          case CoatingSide.Left:
            // Left face: short side = height (y), long side = width (z)
            // Left overlay is at x = -length/2 - 0.001, so hole at x = -length/2 - 0.001 - offset
            position = [-length / 2 - 0.001 - offset, height / 2 - pos1, width / 2 - pos2];
            rotation = [0, Math.PI / 2, 0];
            break;
          case CoatingSide.Right:
            // Right overlay is at x = length/2 + 0.001, so hole at x = length/2 + 0.001 + offset
            position = [length / 2 + 0.001 + offset, height / 2 - pos1, width / 2 - pos2];
            rotation = [0, -Math.PI / 2, 0];
            break;
        }
        
        return (
          <group key={drill.id}>
            {/* Large dark circle on surface - VERY visible, rendered above overlay */}
            <mesh position={position} rotation={rotation}>
              <cylinderGeometry args={[radius, radius, 0.01, 32]} />
              <meshStandardMaterial 
                color="#000000" 
                roughness={0.0}
                metalness={0.0}
                emissive="#000000"
                emissiveIntensity={1}
                depthWrite={false}
              />
            </mesh>
            {/* Inner darker circle for contrast */}
            <mesh position={position} rotation={rotation}>
              <cylinderGeometry args={[radius * 0.8, radius * 0.8, 0.012, 32]} />
              <meshStandardMaterial 
                color="#000000" 
                roughness={0.0}
                metalness={0.0}
                emissive="#000000"
                emissiveIntensity={2}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Mdf3DPreview({
  lengthMm,
  widthMm,
  heightMm,
  coatingSides,
  selectedColor = '#FF6B6B',
  drillPositions = [],
  structure,
}: Mdf3DPreviewProps) {
  // Calculate camera distance based on board size
  const baseScale = 0.01;
  const maxDimension = Math.max(
    lengthMm * baseScale, 
    widthMm * baseScale, 
    heightMm * baseScale
  );
  const cameraDistance = Math.max(15, maxDimension * 3);
  
  return (
    <div className="w-full h-[400px] rounded-lg border-2 border-[#D4C4B0] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      <Canvas>
        <PerspectiveCamera 
          makeDefault 
          position={[cameraDistance, cameraDistance * 0.6, cameraDistance]} 
          fov={50} 
        />
        {/* Neutrale, zachte belichting zodat de kleur
            zo dicht mogelijk bij de gekozen Kempa-kleur
            blijft en niet te donker oogt. */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[10, 10, 5]} intensity={0.3} />
        <directionalLight position={[-10, 10, -5]} intensity={0.2} />
        
        <MdfBoard
          lengthMm={lengthMm}
          widthMm={widthMm}
          heightMm={heightMm}
          coatingSides={coatingSides}
          selectedColor={selectedColor}
          drillPositions={drillPositions}
          structure={structure}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={maxDimension * 1.5}
          maxDistance={maxDimension * 8}
        />
      </Canvas>
      
      <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-gray-600 z-10">
        <p>Sleep om te draaien • Scroll om in/uit te zoomen</p>
      </div>
    </div>
  );
}
