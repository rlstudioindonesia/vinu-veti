import{f as xr,b as Ut,N as Nt,g as ke,F as Fa,M as Mt,V as De,R as Mr,h as dt,w as Ht,W as nn,i as Je,j as Wt,k as In,U as Kt,l as xt,m as bt,n as an,t as Ar,o as Rr,p as ut,q as Cr,r as wr,E as Pr,s as st,P as hn,u as Lr,v as kn,x as Pt,y as Pn,z as _i,I as _n,J as gn,K as Ga,O as Dr,X as Zt,Y as Ln,Z as Ur,_ as yr,$ as ln,a0 as Ir,a1 as Nr,a2 as Or,a3 as Fr,a4 as Gr,a5 as Br,a6 as kr,a7 as Hr,a8 as Vr,a9 as zr,aa as Wr,ab as Xr,ac as jr,ad as qr,ae as Kr,af as Ba,ag as ka,ah as Dn,ai as An,aj as Lt,ak as un,al as Ha,am as jt,an as Yr,ao as Qr,ap as Jr,aq as Zr,ar as Va,as as $r,at as eo,au as to,av as no,d as Be,aw as io,ax as ao,ay as ro,az as Yt,aA as Nn,aB as yt,aC as Dt,aD as za,aE as qt,aF as Ct,aG as Un,aH as Wa,aI as Xa,T as rn,aJ as ja,aK as oo,aL as so,aM as co,aN as qa,aO as Xt,aP as lo,aQ as fo,aR as uo,aS as po,aT as ho,aU as Ka,aV as mo,aW as Ya,aX as Qa,aY as Hn,aZ as Vn,a_ as zn,a$ as Wn,b0 as Ke,b1 as Ri,b2 as Ci,b3 as wi,b4 as Pi,b5 as Li,b6 as Di,b7 as Ui,b8 as yi,b9 as Ii,ba as Ni,bb as Oi,bc as Fi,bd as Gi,be as Bi,bf as ki,bg as Hi,bh as Vi,bi as zi,bj as Wi,bk as Xi,bl as ji,bm as Xn,bn as qi,bo as Ki,bp as _o,bq as Yi,br as Qi,bs as Ji,bt as ii,bu as ai,bv as ri,bw as oi,bx as si,by as ci,bz as li,bA as go,bB as Zi,bC as bo,bD as Rn,bE as vo,bF as $i,bG as ea,bH as ta,bI as fi,bJ as di,bK as Eo,bL as Ja,bM as So,bN as On,bO as To,bP as xo,bQ as Za,bR as $a,bS as na,bT as er,bU as ia,bV as tr,bW as bn,bX as on,bY as nr,bZ as $t,b_ as Mo,b$ as Ao,c0 as Ro,c1 as aa,c2 as ft,c3 as Co,c4 as wo,c5 as Po,c6 as Lo,c7 as Do,A as Uo,c8 as yo,c9 as Io,ca as No,cb as Oo,cc as Fo,cd as Go,ce as Bo,cf as ko,cg as Ho,ch as Vo,ci as zo,cj as Wo,ck as ui,cl as ir,cm as ar,cn as mn,co as yn,cp as At,cq as Xo,cr as jo,D as qo,cs as Ko,Q as rr,ct as Yo,cu as or,cv as Qo,cw as Jo,cx as Zo,cy as $o,cz as jn,cA as es,cB as gi,cC as ts,cD as ns,cE as is,cF as as,cG as rs,cH as os,G as Cn,a as ss,cI as cs,cJ as ls,cK as fs,cL as ds,cM as sr,cN as us,cO as ra,cP as oa,cQ as sa,cR as ps,B as cr,cS as hs}from"./three.core-DY0usrxi.js";import{i as ms}from"./index-CcOV_nru.js";/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function lr(){let e=null,n=!1,t=null,i=null;function a(r,o){t(r,o),i=e.requestAnimationFrame(a)}return{start:function(){n!==!0&&t!==null&&(i=e.requestAnimationFrame(a),n=!0)},stop:function(){e.cancelAnimationFrame(i),n=!1},setAnimationLoop:function(r){t=r},setContext:function(r){e=r}}}function _s(e){const n=new WeakMap;function t(s,l){const f=s.array,m=s.usage,p=f.byteLength,_=e.createBuffer();e.bindBuffer(l,_),e.bufferData(l,f,m),s.onUploadCallback();let S;if(f instanceof Float32Array)S=e.FLOAT;else if(f instanceof Uint16Array)s.isFloat16BufferAttribute?S=e.HALF_FLOAT:S=e.UNSIGNED_SHORT;else if(f instanceof Int16Array)S=e.SHORT;else if(f instanceof Uint32Array)S=e.UNSIGNED_INT;else if(f instanceof Int32Array)S=e.INT;else if(f instanceof Int8Array)S=e.BYTE;else if(f instanceof Uint8Array)S=e.UNSIGNED_BYTE;else if(f instanceof Uint8ClampedArray)S=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+f);return{buffer:_,type:S,bytesPerElement:f.BYTES_PER_ELEMENT,version:s.version,size:p}}function i(s,l,f){const m=l.array,p=l.updateRanges;if(e.bindBuffer(f,s),p.length===0)e.bufferSubData(f,0,m);else{p.sort((S,C)=>S.start-C.start);let _=0;for(let S=1;S<p.length;S++){const C=p[_],A=p[S];A.start<=C.start+C.count+1?C.count=Math.max(C.count,A.start+A.count-C.start):(++_,p[_]=A)}p.length=_+1;for(let S=0,C=p.length;S<C;S++){const A=p[S];e.bufferSubData(f,A.start*m.BYTES_PER_ELEMENT,m,A.start,A.count)}l.clearUpdateRanges()}l.onUploadCallback()}function a(s){return s.isInterleavedBufferAttribute&&(s=s.data),n.get(s)}function r(s){s.isInterleavedBufferAttribute&&(s=s.data);const l=n.get(s);l&&(e.deleteBuffer(l.buffer),n.delete(s))}function o(s,l){if(s.isInterleavedBufferAttribute&&(s=s.data),s.isGLBufferAttribute){const m=n.get(s);(!m||m.version<s.version)&&n.set(s,{buffer:s.buffer,type:s.type,bytesPerElement:s.elementSize,version:s.version});return}const f=n.get(s);if(f===void 0)n.set(s,t(s,l));else if(f.version<s.version){if(f.size!==s.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(f.buffer,s,l),f.version=s.version}}return{get:a,remove:r,update:o}}var gs=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,bs=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,vs=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Es=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ss=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ts=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xs=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ms=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,As=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Rs=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Cs=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ws=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ps=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ls=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ds=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Us=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ys=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Is=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ns=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Os=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Fs=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Gs=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Bs=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,ks=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Hs=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Vs=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zs=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ws=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Xs=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,js=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,qs="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ks=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ys=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Qs=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Js=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Zs=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,$s=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ec=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,tc=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,nc=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ic=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ac=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,rc=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,oc=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,sc=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cc=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lc=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,fc=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,dc=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,uc=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pc=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hc=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,mc=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,_c=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,gc=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,bc=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,vc=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ec=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Sc=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tc=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,xc=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Mc=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ac=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Rc=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Cc=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wc=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Pc=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Lc=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Dc=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Uc=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,yc=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ic=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Nc=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Oc=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fc=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gc=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Bc=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,kc=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Hc=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Vc=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zc=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Wc=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Xc=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,jc=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,qc=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Kc=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Yc=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qc=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jc=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Zc=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,$c=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,el=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,tl=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,nl=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,il=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,al=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,rl=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ol=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,sl=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cl=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ll=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,fl=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,dl=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ul=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,pl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,hl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ml=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const _l=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,gl=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vl=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,El=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sl=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,xl=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ml=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Al=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Rl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Cl=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wl=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Pl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ll=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Dl=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ul=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yl=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Il=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Nl=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ol=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Fl=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Gl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Bl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Hl=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vl=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wl=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Xl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jl=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ql=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Kl=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Yl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,we={alphahash_fragment:gs,alphahash_pars_fragment:bs,alphamap_fragment:vs,alphamap_pars_fragment:Es,alphatest_fragment:Ss,alphatest_pars_fragment:Ts,aomap_fragment:xs,aomap_pars_fragment:Ms,batching_pars_vertex:As,batching_vertex:Rs,begin_vertex:Cs,beginnormal_vertex:ws,bsdfs:Ps,iridescence_fragment:Ls,bumpmap_pars_fragment:Ds,clipping_planes_fragment:Us,clipping_planes_pars_fragment:ys,clipping_planes_pars_vertex:Is,clipping_planes_vertex:Ns,color_fragment:Os,color_pars_fragment:Fs,color_pars_vertex:Gs,color_vertex:Bs,common:ks,cube_uv_reflection_fragment:Hs,defaultnormal_vertex:Vs,displacementmap_pars_vertex:zs,displacementmap_vertex:Ws,emissivemap_fragment:Xs,emissivemap_pars_fragment:js,colorspace_fragment:qs,colorspace_pars_fragment:Ks,envmap_fragment:Ys,envmap_common_pars_fragment:Qs,envmap_pars_fragment:Js,envmap_pars_vertex:Zs,envmap_physical_pars_fragment:lc,envmap_vertex:$s,fog_vertex:ec,fog_pars_vertex:tc,fog_fragment:nc,fog_pars_fragment:ic,gradientmap_pars_fragment:ac,lightmap_pars_fragment:rc,lights_lambert_fragment:oc,lights_lambert_pars_fragment:sc,lights_pars_begin:cc,lights_toon_fragment:fc,lights_toon_pars_fragment:dc,lights_phong_fragment:uc,lights_phong_pars_fragment:pc,lights_physical_fragment:hc,lights_physical_pars_fragment:mc,lights_fragment_begin:_c,lights_fragment_maps:gc,lights_fragment_end:bc,logdepthbuf_fragment:vc,logdepthbuf_pars_fragment:Ec,logdepthbuf_pars_vertex:Sc,logdepthbuf_vertex:Tc,map_fragment:xc,map_pars_fragment:Mc,map_particle_fragment:Ac,map_particle_pars_fragment:Rc,metalnessmap_fragment:Cc,metalnessmap_pars_fragment:wc,morphinstance_vertex:Pc,morphcolor_vertex:Lc,morphnormal_vertex:Dc,morphtarget_pars_vertex:Uc,morphtarget_vertex:yc,normal_fragment_begin:Ic,normal_fragment_maps:Nc,normal_pars_fragment:Oc,normal_pars_vertex:Fc,normal_vertex:Gc,normalmap_pars_fragment:Bc,clearcoat_normal_fragment_begin:kc,clearcoat_normal_fragment_maps:Hc,clearcoat_pars_fragment:Vc,iridescence_pars_fragment:zc,opaque_fragment:Wc,packing:Xc,premultiplied_alpha_fragment:jc,project_vertex:qc,dithering_fragment:Kc,dithering_pars_fragment:Yc,roughnessmap_fragment:Qc,roughnessmap_pars_fragment:Jc,shadowmap_pars_fragment:Zc,shadowmap_pars_vertex:$c,shadowmap_vertex:el,shadowmask_pars_fragment:tl,skinbase_vertex:nl,skinning_pars_vertex:il,skinning_vertex:al,skinnormal_vertex:rl,specularmap_fragment:ol,specularmap_pars_fragment:sl,tonemapping_fragment:cl,tonemapping_pars_fragment:ll,transmission_fragment:fl,transmission_pars_fragment:dl,uv_pars_fragment:ul,uv_pars_vertex:pl,uv_vertex:hl,worldpos_vertex:ml,background_vert:_l,background_frag:gl,backgroundCube_vert:bl,backgroundCube_frag:vl,cube_vert:El,cube_frag:Sl,depth_vert:Tl,depth_frag:xl,distanceRGBA_vert:Ml,distanceRGBA_frag:Al,equirect_vert:Rl,equirect_frag:Cl,linedashed_vert:wl,linedashed_frag:Pl,meshbasic_vert:Ll,meshbasic_frag:Dl,meshlambert_vert:Ul,meshlambert_frag:yl,meshmatcap_vert:Il,meshmatcap_frag:Nl,meshnormal_vert:Ol,meshnormal_frag:Fl,meshphong_vert:Gl,meshphong_frag:Bl,meshphysical_vert:kl,meshphysical_frag:Hl,meshtoon_vert:Vl,meshtoon_frag:zl,points_vert:Wl,points_frag:Xl,shadow_vert:jl,shadow_frag:ql,sprite_vert:Kl,sprite_frag:Yl},ee={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new st(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new st(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},St={basic:{uniforms:ft([ee.common,ee.specularmap,ee.envmap,ee.aomap,ee.lightmap,ee.fog]),vertexShader:we.meshbasic_vert,fragmentShader:we.meshbasic_frag},lambert:{uniforms:ft([ee.common,ee.specularmap,ee.envmap,ee.aomap,ee.lightmap,ee.emissivemap,ee.bumpmap,ee.normalmap,ee.displacementmap,ee.fog,ee.lights,{emissive:{value:new ke(0)}}]),vertexShader:we.meshlambert_vert,fragmentShader:we.meshlambert_frag},phong:{uniforms:ft([ee.common,ee.specularmap,ee.envmap,ee.aomap,ee.lightmap,ee.emissivemap,ee.bumpmap,ee.normalmap,ee.displacementmap,ee.fog,ee.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30}}]),vertexShader:we.meshphong_vert,fragmentShader:we.meshphong_frag},standard:{uniforms:ft([ee.common,ee.envmap,ee.aomap,ee.lightmap,ee.emissivemap,ee.bumpmap,ee.normalmap,ee.displacementmap,ee.roughnessmap,ee.metalnessmap,ee.fog,ee.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:we.meshphysical_vert,fragmentShader:we.meshphysical_frag},toon:{uniforms:ft([ee.common,ee.aomap,ee.lightmap,ee.emissivemap,ee.bumpmap,ee.normalmap,ee.displacementmap,ee.gradientmap,ee.fog,ee.lights,{emissive:{value:new ke(0)}}]),vertexShader:we.meshtoon_vert,fragmentShader:we.meshtoon_frag},matcap:{uniforms:ft([ee.common,ee.bumpmap,ee.normalmap,ee.displacementmap,ee.fog,{matcap:{value:null}}]),vertexShader:we.meshmatcap_vert,fragmentShader:we.meshmatcap_frag},points:{uniforms:ft([ee.points,ee.fog]),vertexShader:we.points_vert,fragmentShader:we.points_frag},dashed:{uniforms:ft([ee.common,ee.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:we.linedashed_vert,fragmentShader:we.linedashed_frag},depth:{uniforms:ft([ee.common,ee.displacementmap]),vertexShader:we.depth_vert,fragmentShader:we.depth_frag},normal:{uniforms:ft([ee.common,ee.bumpmap,ee.normalmap,ee.displacementmap,{opacity:{value:1}}]),vertexShader:we.meshnormal_vert,fragmentShader:we.meshnormal_frag},sprite:{uniforms:ft([ee.sprite,ee.fog]),vertexShader:we.sprite_vert,fragmentShader:we.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:we.background_vert,fragmentShader:we.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:we.backgroundCube_vert,fragmentShader:we.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:we.cube_vert,fragmentShader:we.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:we.equirect_vert,fragmentShader:we.equirect_frag},distanceRGBA:{uniforms:ft([ee.common,ee.displacementmap,{referencePosition:{value:new De},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:we.distanceRGBA_vert,fragmentShader:we.distanceRGBA_frag},shadow:{uniforms:ft([ee.lights,ee.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:we.shadow_vert,fragmentShader:we.shadow_frag}};St.physical={uniforms:ft([St.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new st(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new st},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new st},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:we.meshphysical_vert,fragmentShader:we.meshphysical_frag};const Sn={r:0,b:0,g:0},Gt=new er,Ql=new Mt;function Jl(e,n,t,i,a,r,o){const s=new ke(0);let l=r===!0?0:1,f,m,p=null,_=0,S=null;function C(T){let b=T.isScene===!0?T.background:null;return b&&b.isTexture&&(b=(T.backgroundBlurriness>0?t:n).get(b)),b}function A(T){let b=!1;const N=C(T);N===null?c(s,l):N&&N.isColor&&(c(N,1),b=!0);const L=e.xr.getEnvironmentBlendMode();L==="additive"?i.buffers.color.setClear(0,0,0,1,o):L==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(e.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function u(T,b){const N=C(b);N&&(N.isCubeTexture||N.mapping===On)?(m===void 0&&(m=new Dt(new $a(1,1,1),new Yt({name:"BackgroundCubeMaterial",uniforms:na(St.backgroundCube.uniforms),vertexShader:St.backgroundCube.vertexShader,fragmentShader:St.backgroundCube.fragmentShader,side:bt,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(L,U,G){this.matrixWorld.copyPosition(G.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(m)),Gt.copy(b.backgroundRotation),Gt.x*=-1,Gt.y*=-1,Gt.z*=-1,N.isCubeTexture&&N.isRenderTargetTexture===!1&&(Gt.y*=-1,Gt.z*=-1),m.material.uniforms.envMap.value=N,m.material.uniforms.flipEnvMap.value=N.isCubeTexture&&N.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(Ql.makeRotationFromEuler(Gt)),m.material.toneMapped=Je.getTransfer(N.colorSpace)!==Ke,(p!==N||_!==N.version||S!==e.toneMapping)&&(m.material.needsUpdate=!0,p=N,_=N.version,S=e.toneMapping),m.layers.enableAll(),T.unshift(m,m.geometry,m.material,0,0,null)):N&&N.isTexture&&(f===void 0&&(f=new Dt(new ja(2,2),new Yt({name:"BackgroundMaterial",uniforms:na(St.background.uniforms),vertexShader:St.background.vertexShader,fragmentShader:St.background.fragmentShader,side:an,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),Object.defineProperty(f.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(f)),f.material.uniforms.t2D.value=N,f.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,f.material.toneMapped=Je.getTransfer(N.colorSpace)!==Ke,N.matrixAutoUpdate===!0&&N.updateMatrix(),f.material.uniforms.uvTransform.value.copy(N.matrix),(p!==N||_!==N.version||S!==e.toneMapping)&&(f.material.needsUpdate=!0,p=N,_=N.version,S=e.toneMapping),f.layers.enableAll(),T.unshift(f,f.geometry,f.material,0,0,null))}function c(T,b){T.getRGB(Sn,Za(e)),i.buffers.color.setClear(Sn.r,Sn.g,Sn.b,b,o)}function x(){m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0),f!==void 0&&(f.geometry.dispose(),f.material.dispose(),f=void 0)}return{getClearColor:function(){return s},setClearColor:function(T,b=1){s.set(T),l=b,c(s,l)},getClearAlpha:function(){return l},setClearAlpha:function(T){l=T,c(s,l)},render:A,addToRenderList:u,dispose:x}}function Zl(e,n){const t=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},a=_(null);let r=a,o=!1;function s(g,D,j,H,q){let J=!1;const z=p(H,j,D);r!==z&&(r=z,f(r.object)),J=S(g,H,j,q),J&&C(g,H,j,q),q!==null&&n.update(q,e.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,b(g,D,j,H),q!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n.get(q).buffer))}function l(){return e.createVertexArray()}function f(g){return e.bindVertexArray(g)}function m(g){return e.deleteVertexArray(g)}function p(g,D,j){const H=j.wireframe===!0;let q=i[g.id];q===void 0&&(q={},i[g.id]=q);let J=q[D.id];J===void 0&&(J={},q[D.id]=J);let z=J[H];return z===void 0&&(z=_(l()),J[H]=z),z}function _(g){const D=[],j=[],H=[];for(let q=0;q<t;q++)D[q]=0,j[q]=0,H[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:j,attributeDivisors:H,object:g,attributes:{},index:null}}function S(g,D,j,H){const q=r.attributes,J=D.attributes;let z=0;const $=j.getAttributes();for(const B in $)if($[B].location>=0){const Ee=q[B];let Pe=J[B];if(Pe===void 0&&(B==="instanceMatrix"&&g.instanceMatrix&&(Pe=g.instanceMatrix),B==="instanceColor"&&g.instanceColor&&(Pe=g.instanceColor)),Ee===void 0||Ee.attribute!==Pe||Pe&&Ee.data!==Pe.data)return!0;z++}return r.attributesNum!==z||r.index!==H}function C(g,D,j,H){const q={},J=D.attributes;let z=0;const $=j.getAttributes();for(const B in $)if($[B].location>=0){let Ee=J[B];Ee===void 0&&(B==="instanceMatrix"&&g.instanceMatrix&&(Ee=g.instanceMatrix),B==="instanceColor"&&g.instanceColor&&(Ee=g.instanceColor));const Pe={};Pe.attribute=Ee,Ee&&Ee.data&&(Pe.data=Ee.data),q[B]=Pe,z++}r.attributes=q,r.attributesNum=z,r.index=H}function A(){const g=r.newAttributes;for(let D=0,j=g.length;D<j;D++)g[D]=0}function u(g){c(g,0)}function c(g,D){const j=r.newAttributes,H=r.enabledAttributes,q=r.attributeDivisors;j[g]=1,H[g]===0&&(e.enableVertexAttribArray(g),H[g]=1),q[g]!==D&&(e.vertexAttribDivisor(g,D),q[g]=D)}function x(){const g=r.newAttributes,D=r.enabledAttributes;for(let j=0,H=D.length;j<H;j++)D[j]!==g[j]&&(e.disableVertexAttribArray(j),D[j]=0)}function T(g,D,j,H,q,J,z){z===!0?e.vertexAttribIPointer(g,D,j,q,J):e.vertexAttribPointer(g,D,j,H,q,J)}function b(g,D,j,H){A();const q=H.attributes,J=j.getAttributes(),z=D.defaultAttributeValues;for(const $ in J){const B=J[$];if(B.location>=0){let me=q[$];if(me===void 0&&($==="instanceMatrix"&&g.instanceMatrix&&(me=g.instanceMatrix),$==="instanceColor"&&g.instanceColor&&(me=g.instanceColor)),me!==void 0){const Ee=me.normalized,Pe=me.itemSize,Ve=n.get(me);if(Ve===void 0)continue;const Ze=Ve.buffer,V=Ve.type,Z=Ve.bytesPerElement,ue=V===e.INT||V===e.UNSIGNED_INT||me.gpuType===qa;if(me.isInterleavedBufferAttribute){const ie=me.data,ve=ie.stride,He=me.offset;if(ie.isInstancedInterleavedBuffer){for(let Te=0;Te<B.locationSize;Te++)c(B.location+Te,ie.meshPerAttribute);g.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let Te=0;Te<B.locationSize;Te++)u(B.location+Te);e.bindBuffer(e.ARRAY_BUFFER,Ze);for(let Te=0;Te<B.locationSize;Te++)T(B.location+Te,Pe/B.locationSize,V,Ee,ve*Z,(He+Pe/B.locationSize*Te)*Z,ue)}else{if(me.isInstancedBufferAttribute){for(let ie=0;ie<B.locationSize;ie++)c(B.location+ie,me.meshPerAttribute);g.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let ie=0;ie<B.locationSize;ie++)u(B.location+ie);e.bindBuffer(e.ARRAY_BUFFER,Ze);for(let ie=0;ie<B.locationSize;ie++)T(B.location+ie,Pe/B.locationSize,V,Ee,Pe*Z,Pe/B.locationSize*ie*Z,ue)}}else if(z!==void 0){const Ee=z[$];if(Ee!==void 0)switch(Ee.length){case 2:e.vertexAttrib2fv(B.location,Ee);break;case 3:e.vertexAttrib3fv(B.location,Ee);break;case 4:e.vertexAttrib4fv(B.location,Ee);break;default:e.vertexAttrib1fv(B.location,Ee)}}}}x()}function N(){G();for(const g in i){const D=i[g];for(const j in D){const H=D[j];for(const q in H)m(H[q].object),delete H[q];delete D[j]}delete i[g]}}function L(g){if(i[g.id]===void 0)return;const D=i[g.id];for(const j in D){const H=D[j];for(const q in H)m(H[q].object),delete H[q];delete D[j]}delete i[g.id]}function U(g){for(const D in i){const j=i[D];if(j[g.id]===void 0)continue;const H=j[g.id];for(const q in H)m(H[q].object),delete H[q];delete j[g.id]}}function G(){v(),o=!0,r!==a&&(r=a,f(r.object))}function v(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:s,reset:G,resetDefaultState:v,dispose:N,releaseStatesOfGeometry:L,releaseStatesOfProgram:U,initAttributes:A,enableAttribute:u,disableUnusedAttributes:x}}function $l(e,n,t){let i;function a(f){i=f}function r(f,m){e.drawArrays(i,f,m),t.update(m,i,1)}function o(f,m,p){p!==0&&(e.drawArraysInstanced(i,f,m,p),t.update(m,i,p))}function s(f,m,p){if(p===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,f,0,m,0,p);let S=0;for(let C=0;C<p;C++)S+=m[C];t.update(S,i,1)}function l(f,m,p,_){if(p===0)return;const S=n.get("WEBGL_multi_draw");if(S===null)for(let C=0;C<f.length;C++)o(f[C],m[C],_[C]);else{S.multiDrawArraysInstancedWEBGL(i,f,0,m,0,_,0,p);let C=0;for(let A=0;A<p;A++)C+=m[A]*_[A];t.update(C,i,1)}}this.setMode=a,this.render=r,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=l}function ef(e,n,t,i){let a;function r(){if(a!==void 0)return a;if(n.has("EXT_texture_filter_anisotropic")===!0){const U=n.get("EXT_texture_filter_anisotropic");a=e.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function o(U){return!(U!==Pt&&i.convert(U)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(U){const G=U===In&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(U!==Kt&&i.convert(U)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&U!==Xt&&!G)}function l(U){if(U==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let f=t.precision!==void 0?t.precision:"highp";const m=l(f);m!==f&&(console.warn("THREE.WebGLRenderer:",f,"not supported, using",m,"instead."),f=m);const p=t.logarithmicDepthBuffer===!0,_=t.reverseDepthBuffer===!0&&n.has("EXT_clip_control"),S=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),C=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),A=e.getParameter(e.MAX_TEXTURE_SIZE),u=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),c=e.getParameter(e.MAX_VERTEX_ATTRIBS),x=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),T=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),N=C>0,L=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:s,precision:f,logarithmicDepthBuffer:p,reverseDepthBuffer:_,maxTextures:S,maxVertexTextures:C,maxTextureSize:A,maxCubemapSize:u,maxAttributes:c,maxVertexUniforms:x,maxVaryings:T,maxFragmentUniforms:b,vertexTextures:N,maxSamples:L}}function tf(e){const n=this;let t=null,i=0,a=!1,r=!1;const o=new no,s=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,_){const S=p.length!==0||_||i!==0||a;return a=_,i=p.length,S},this.beginShadows=function(){r=!0,m(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(p,_){t=m(p,_,0)},this.setState=function(p,_,S){const C=p.clippingPlanes,A=p.clipIntersection,u=p.clipShadows,c=e.get(p);if(!a||C===null||C.length===0||r&&!u)r?m(null):f();else{const x=r?0:i,T=x*4;let b=c.clippingState||null;l.value=b,b=m(C,_,T,S);for(let N=0;N!==T;++N)b[N]=t[N];c.clippingState=b,this.numIntersection=A?this.numPlanes:0,this.numPlanes+=x}};function f(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),n.numPlanes=i,n.numIntersection=0}function m(p,_,S,C){const A=p!==null?p.length:0;let u=null;if(A!==0){if(u=l.value,C!==!0||u===null){const c=S+A*4,x=_.matrixWorldInverse;s.getNormalMatrix(x),(u===null||u.length<c)&&(u=new Float32Array(c));for(let T=0,b=S;T!==A;++T,b+=4)o.copy(p[T]).applyMatrix4(x,s),o.normal.toArray(u,b),u[b+3]=o.constant}l.value=u,l.needsUpdate=!0}return n.numPlanes=A,n.numIntersection=0,u}}function nf(e){let n=new WeakMap;function t(o,s){return s===fi?o.mapping=bn:s===di&&(o.mapping=on),o}function i(o){if(o&&o.isTexture){const s=o.mapping;if(s===fi||s===di)if(n.has(o)){const l=n.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const f=new Eo(l.height);return f.fromEquirectangularTexture(e,o),n.set(o,f),o.addEventListener("dispose",a),t(f.texture,o.mapping)}else return null}}return o}function a(o){const s=o.target;s.removeEventListener("dispose",a);const l=n.get(s);l!==void 0&&(n.delete(s),l.dispose())}function r(){n=new WeakMap}return{get:i,dispose:r}}const en=4,ca=[.125,.215,.35,.446,.526,.582],zt=20,qn=new nr,la=new ke;let Kn=null,Yn=0,Qn=0,Jn=!1;const Vt=(1+Math.sqrt(5))/2,Jt=1/Vt,fa=[new De(-Vt,Jt,0),new De(Vt,Jt,0),new De(-Jt,0,Vt),new De(Jt,0,Vt),new De(0,Vt,-Jt),new De(0,Vt,Jt),new De(-1,1,-1),new De(1,1,-1),new De(-1,1,1),new De(1,1,1)],af=new De;class da{constructor(n){this._renderer=n,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(n,t=0,i=.1,a=100,r={}){const{size:o=256,position:s=af}=r;Kn=this._renderer.getRenderTarget(),Yn=this._renderer.getActiveCubeFace(),Qn=this._renderer.getActiveMipmapLevel(),Jn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(n,i,a,l,s),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(n,t=null){return this._fromTexture(n,t)}fromCubemap(n,t=null){return this._fromTexture(n,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ha(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pa(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(n){this._lodMax=Math.floor(Math.log2(n)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let n=0;n<this._lodPlanes.length;n++)this._lodPlanes[n].dispose()}_cleanup(n){this._renderer.setRenderTarget(Kn,Yn,Qn),this._renderer.xr.enabled=Jn,n.scissorTest=!1,Tn(n,0,0,n.width,n.height)}_fromTexture(n,t){n.mapping===bn||n.mapping===on?this._setSize(n.image.length===0?16:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4),Kn=this._renderer.getRenderTarget(),Yn=this._renderer.getActiveCubeFace(),Qn=this._renderer.getActiveMipmapLevel(),Jn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(n,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const n=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Lt,minFilter:Lt,generateMipmaps:!1,type:In,format:Pt,colorSpace:ut,depthBuffer:!1},a=ua(n,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==n||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ua(n,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=rf(r)),this._blurMaterial=of(r,n,t)}return a}_compileMaterial(n){const t=new Dt(this._lodPlanes[0],n);this._renderer.compile(t,qn)}_sceneToCubeUV(n,t,i,a,r){const l=new hn(90,1,t,i),f=[1,-1,1,1,1,1],m=[1,1,1,-1,-1,-1],p=this._renderer,_=p.autoClear,S=p.toneMapping;p.getClearColor(la),p.toneMapping=Nt,p.autoClear=!1;const C=new $t({name:"PMREM.Background",side:bt,depthWrite:!1,depthTest:!1}),A=new Dt(new $a,C);let u=!1;const c=n.background;c?c.isColor&&(C.color.copy(c),n.background=null,u=!0):(C.color.copy(la),u=!0);for(let x=0;x<6;x++){const T=x%3;T===0?(l.up.set(0,f[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+m[x],r.y,r.z)):T===1?(l.up.set(0,0,f[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+m[x],r.z)):(l.up.set(0,f[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+m[x]));const b=this._cubeSize;Tn(a,T*b,x>2?b:0,b,b),p.setRenderTarget(a),u&&p.render(A,l),p.render(n,l)}A.geometry.dispose(),A.material.dispose(),p.toneMapping=S,p.autoClear=_,n.background=c}_textureToCubeUV(n,t){const i=this._renderer,a=n.mapping===bn||n.mapping===on;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=ha()),this._cubemapMaterial.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pa());const r=a?this._cubemapMaterial:this._equirectMaterial,o=new Dt(this._lodPlanes[0],r),s=r.uniforms;s.envMap.value=n;const l=this._cubeSize;Tn(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,qn)}_applyPMREM(n){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const a=this._lodPlanes.length;for(let r=1;r<a;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),s=fa[(a-r-1)%fa.length];this._blur(n,r-1,r,o,s)}t.autoClear=i}_blur(n,t,i,a,r){const o=this._pingPongRenderTarget;this._halfBlur(n,o,t,i,a,"latitudinal",r),this._halfBlur(o,n,i,i,a,"longitudinal",r)}_halfBlur(n,t,i,a,r,o,s){const l=this._renderer,f=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,p=new Dt(this._lodPlanes[a],f),_=f.uniforms,S=this._sizeLods[i]-1,C=isFinite(r)?Math.PI/(2*S):2*Math.PI/(2*zt-1),A=r/C,u=isFinite(r)?1+Math.floor(m*A):zt;u>zt&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${u} samples when the maximum is set to ${zt}`);const c=[];let x=0;for(let U=0;U<zt;++U){const G=U/A,v=Math.exp(-G*G/2);c.push(v),U===0?x+=v:U<u&&(x+=2*v)}for(let U=0;U<c.length;U++)c[U]=c[U]/x;_.envMap.value=n.texture,_.samples.value=u,_.weights.value=c,_.latitudinal.value=o==="latitudinal",s&&(_.poleAxis.value=s);const{_lodMax:T}=this;_.dTheta.value=C,_.mipInt.value=T-i;const b=this._sizeLods[a],N=3*b*(a>T-en?a-T+en:0),L=4*(this._cubeSize-b);Tn(t,N,L,3*b,2*b),l.setRenderTarget(t),l.render(p,qn)}}function rf(e){const n=[],t=[],i=[];let a=e;const r=e-en+1+ca.length;for(let o=0;o<r;o++){const s=Math.pow(2,a);t.push(s);let l=1/s;o>e-en?l=ca[o-e+en-1]:o===0&&(l=0),i.push(l);const f=1/(s-2),m=-f,p=1+f,_=[m,m,p,m,p,p,m,m,p,p,m,p],S=6,C=6,A=3,u=2,c=1,x=new Float32Array(A*C*S),T=new Float32Array(u*C*S),b=new Float32Array(c*C*S);for(let L=0;L<S;L++){const U=L%3*2/3-1,G=L>2?0:-1,v=[U,G,0,U+2/3,G,0,U+2/3,G+1,0,U,G,0,U+2/3,G+1,0,U,G+1,0];x.set(v,A*C*L),T.set(_,u*C*L);const g=[L,L,L,L,L,L];b.set(g,c*C*L)}const N=new Nn;N.setAttribute("position",new yt(x,A)),N.setAttribute("uv",new yt(T,u)),N.setAttribute("faceIndex",new yt(b,c)),n.push(N),a>en&&a--}return{lodPlanes:n,sizeLods:t,sigmas:i}}function ua(e,n,t){const i=new nn(e,n,t);return i.texture.mapping=On,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Tn(e,n,t,i,a){e.viewport.set(n,t,i,a),e.scissor.set(n,t,i,a)}function of(e,n,t){const i=new Float32Array(zt),a=new De(0,1,0);return new Yt({name:"SphericalGaussianBlur",defines:{n:zt,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:bi(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:qt,depthTest:!1,depthWrite:!1})}function pa(){return new Yt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:bi(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:qt,depthTest:!1,depthWrite:!1})}function ha(){return new Yt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:bi(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qt,depthTest:!1,depthWrite:!1})}function bi(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function sf(e){let n=new WeakMap,t=null;function i(s){if(s&&s.isTexture){const l=s.mapping,f=l===fi||l===di,m=l===bn||l===on;if(f||m){let p=n.get(s);const _=p!==void 0?p.texture.pmremVersion:0;if(s.isRenderTargetTexture&&s.pmremVersion!==_)return t===null&&(t=new da(e)),p=f?t.fromEquirectangular(s,p):t.fromCubemap(s,p),p.texture.pmremVersion=s.pmremVersion,n.set(s,p),p.texture;if(p!==void 0)return p.texture;{const S=s.image;return f&&S&&S.height>0||m&&S&&a(S)?(t===null&&(t=new da(e)),p=f?t.fromEquirectangular(s):t.fromCubemap(s),p.texture.pmremVersion=s.pmremVersion,n.set(s,p),s.addEventListener("dispose",r),p.texture):null}}}return s}function a(s){let l=0;const f=6;for(let m=0;m<f;m++)s[m]!==void 0&&l++;return l===f}function r(s){const l=s.target;l.removeEventListener("dispose",r);const f=n.get(l);f!==void 0&&(n.delete(l),f.dispose())}function o(){n=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function cf(e){const n={};function t(i){if(n[i]!==void 0)return n[i];let a;switch(i){case"WEBGL_depth_texture":a=e.getExtension("WEBGL_depth_texture")||e.getExtension("MOZ_WEBGL_depth_texture")||e.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=e.getExtension("WEBGL_compressed_texture_s3tc")||e.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=e.getExtension("WEBGL_compressed_texture_pvrtc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=e.getExtension(i)}return n[i]=a,a}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const a=t(i);return a===null&&Ht("THREE.WebGLRenderer: "+i+" extension not supported."),a}}}function lf(e,n,t,i){const a={},r=new WeakMap;function o(p){const _=p.target;_.index!==null&&n.remove(_.index);for(const C in _.attributes)n.remove(_.attributes[C]);_.removeEventListener("dispose",o),delete a[_.id];const S=r.get(_);S&&(n.remove(S),r.delete(_)),i.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function s(p,_){return a[_.id]===!0||(_.addEventListener("dispose",o),a[_.id]=!0,t.memory.geometries++),_}function l(p){const _=p.attributes;for(const S in _)n.update(_[S],e.ARRAY_BUFFER)}function f(p){const _=[],S=p.index,C=p.attributes.position;let A=0;if(S!==null){const x=S.array;A=S.version;for(let T=0,b=x.length;T<b;T+=3){const N=x[T+0],L=x[T+1],U=x[T+2];_.push(N,L,L,U,U,N)}}else if(C!==void 0){const x=C.array;A=C.version;for(let T=0,b=x.length/3-1;T<b;T+=3){const N=T+0,L=T+1,U=T+2;_.push(N,L,L,U,U,N)}}else return;const u=new(Ro(_)?Mo:Ao)(_,1);u.version=A;const c=r.get(p);c&&n.remove(c),r.set(p,u)}function m(p){const _=r.get(p);if(_){const S=p.index;S!==null&&_.version<S.version&&f(p)}else f(p);return r.get(p)}return{get:s,update:l,getWireframeAttribute:m}}function ff(e,n,t){let i;function a(_){i=_}let r,o;function s(_){r=_.type,o=_.bytesPerElement}function l(_,S){e.drawElements(i,S,r,_*o),t.update(S,i,1)}function f(_,S,C){C!==0&&(e.drawElementsInstanced(i,S,r,_*o,C),t.update(S,i,C))}function m(_,S,C){if(C===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,S,0,r,_,0,C);let u=0;for(let c=0;c<C;c++)u+=S[c];t.update(u,i,1)}function p(_,S,C,A){if(C===0)return;const u=n.get("WEBGL_multi_draw");if(u===null)for(let c=0;c<_.length;c++)f(_[c]/o,S[c],A[c]);else{u.multiDrawElementsInstancedWEBGL(i,S,0,r,_,0,A,0,C);let c=0;for(let x=0;x<C;x++)c+=S[x]*A[x];t.update(c,i,1)}}this.setMode=a,this.setIndex=s,this.render=l,this.renderInstances=f,this.renderMultiDraw=m,this.renderMultiDrawInstances=p}function df(e){const n={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,s){switch(t.calls++,o){case e.TRIANGLES:t.triangles+=s*(r/3);break;case e.LINES:t.lines+=s*(r/2);break;case e.LINE_STRIP:t.lines+=s*(r-1);break;case e.LINE_LOOP:t.lines+=s*r;break;case e.POINTS:t.points+=s*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:n,render:t,programs:null,autoReset:!0,reset:a,update:i}}function uf(e,n,t){const i=new WeakMap,a=new dt;function r(o,s,l){const f=o.morphTargetInfluences,m=s.morphAttributes.position||s.morphAttributes.normal||s.morphAttributes.color,p=m!==void 0?m.length:0;let _=i.get(s);if(_===void 0||_.count!==p){let v=function(){U.dispose(),i.delete(s),s.removeEventListener("dispose",v)};_!==void 0&&_.texture.dispose();const S=s.morphAttributes.position!==void 0,C=s.morphAttributes.normal!==void 0,A=s.morphAttributes.color!==void 0,u=s.morphAttributes.position||[],c=s.morphAttributes.normal||[],x=s.morphAttributes.color||[];let T=0;S===!0&&(T=1),C===!0&&(T=2),A===!0&&(T=3);let b=s.attributes.position.count*T,N=1;b>n.maxTextureSize&&(N=Math.ceil(b/n.maxTextureSize),b=n.maxTextureSize);const L=new Float32Array(b*N*4*p),U=new Ja(L,b,N,p);U.type=Xt,U.needsUpdate=!0;const G=T*4;for(let g=0;g<p;g++){const D=u[g],j=c[g],H=x[g],q=b*N*4*g;for(let J=0;J<D.count;J++){const z=J*G;S===!0&&(a.fromBufferAttribute(D,J),L[q+z+0]=a.x,L[q+z+1]=a.y,L[q+z+2]=a.z,L[q+z+3]=0),C===!0&&(a.fromBufferAttribute(j,J),L[q+z+4]=a.x,L[q+z+5]=a.y,L[q+z+6]=a.z,L[q+z+7]=0),A===!0&&(a.fromBufferAttribute(H,J),L[q+z+8]=a.x,L[q+z+9]=a.y,L[q+z+10]=a.z,L[q+z+11]=H.itemSize===4?a.w:1)}}_={count:p,texture:U,size:new st(b,N)},i.set(s,_),s.addEventListener("dispose",v)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",o.morphTexture,t);else{let S=0;for(let A=0;A<f.length;A++)S+=f[A];const C=s.morphTargetsRelative?1:1-S;l.getUniforms().setValue(e,"morphTargetBaseInfluence",C),l.getUniforms().setValue(e,"morphTargetInfluences",f)}l.getUniforms().setValue(e,"morphTargetsTexture",_.texture,t),l.getUniforms().setValue(e,"morphTargetsTextureSize",_.size)}return{update:r}}function pf(e,n,t,i){let a=new WeakMap;function r(l){const f=i.render.frame,m=l.geometry,p=n.get(l,m);if(a.get(p)!==f&&(n.update(p),a.set(p,f)),l.isInstancedMesh&&(l.hasEventListener("dispose",s)===!1&&l.addEventListener("dispose",s),a.get(l)!==f&&(t.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,e.ARRAY_BUFFER),a.set(l,f))),l.isSkinnedMesh){const _=l.skeleton;a.get(_)!==f&&(_.update(),a.set(_,f))}return p}function o(){a=new WeakMap}function s(l){const f=l.target;f.removeEventListener("dispose",s),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:r,dispose:o}}const fr=new rn,ma=new Ga(1,1),dr=new Ja,ur=new Fo,pr=new Oo,_a=[],ga=[],ba=new Float32Array(16),va=new Float32Array(9),Ea=new Float32Array(4);function sn(e,n,t){const i=e[0];if(i<=0||i>0)return e;const a=n*t;let r=_a[a];if(r===void 0&&(r=new Float32Array(a),_a[a]=r),n!==0){i.toArray(r,0);for(let o=1,s=0;o!==n;++o)s+=t,e[o].toArray(r,s)}return r}function it(e,n){if(e.length!==n.length)return!1;for(let t=0,i=e.length;t<i;t++)if(e[t]!==n[t])return!1;return!0}function at(e,n){for(let t=0,i=n.length;t<i;t++)e[t]=n[t]}function Fn(e,n){let t=ga[n];t===void 0&&(t=new Int32Array(n),ga[n]=t);for(let i=0;i!==n;++i)t[i]=e.allocateTextureUnit();return t}function hf(e,n){const t=this.cache;t[0]!==n&&(e.uniform1f(this.addr,n),t[0]=n)}function mf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2f(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(it(t,n))return;e.uniform2fv(this.addr,n),at(t,n)}}function _f(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3f(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else if(n.r!==void 0)(t[0]!==n.r||t[1]!==n.g||t[2]!==n.b)&&(e.uniform3f(this.addr,n.r,n.g,n.b),t[0]=n.r,t[1]=n.g,t[2]=n.b);else{if(it(t,n))return;e.uniform3fv(this.addr,n),at(t,n)}}function gf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4f(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(it(t,n))return;e.uniform4fv(this.addr,n),at(t,n)}}function bf(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(it(t,n))return;e.uniformMatrix2fv(this.addr,!1,n),at(t,n)}else{if(it(t,i))return;Ea.set(i),e.uniformMatrix2fv(this.addr,!1,Ea),at(t,i)}}function vf(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(it(t,n))return;e.uniformMatrix3fv(this.addr,!1,n),at(t,n)}else{if(it(t,i))return;va.set(i),e.uniformMatrix3fv(this.addr,!1,va),at(t,i)}}function Ef(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(it(t,n))return;e.uniformMatrix4fv(this.addr,!1,n),at(t,n)}else{if(it(t,i))return;ba.set(i),e.uniformMatrix4fv(this.addr,!1,ba),at(t,i)}}function Sf(e,n){const t=this.cache;t[0]!==n&&(e.uniform1i(this.addr,n),t[0]=n)}function Tf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2i(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(it(t,n))return;e.uniform2iv(this.addr,n),at(t,n)}}function xf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3i(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(it(t,n))return;e.uniform3iv(this.addr,n),at(t,n)}}function Mf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4i(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(it(t,n))return;e.uniform4iv(this.addr,n),at(t,n)}}function Af(e,n){const t=this.cache;t[0]!==n&&(e.uniform1ui(this.addr,n),t[0]=n)}function Rf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2ui(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(it(t,n))return;e.uniform2uiv(this.addr,n),at(t,n)}}function Cf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3ui(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(it(t,n))return;e.uniform3uiv(this.addr,n),at(t,n)}}function wf(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4ui(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(it(t,n))return;e.uniform4uiv(this.addr,n),at(t,n)}}function Pf(e,n,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a);let r;this.type===e.SAMPLER_2D_SHADOW?(ma.compareFunction=Va,r=ma):r=fr,t.setTexture2D(n||r,a)}function Lf(e,n,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),t.setTexture3D(n||ur,a)}function Df(e,n,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),t.setTextureCube(n||pr,a)}function Uf(e,n,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),t.setTexture2DArray(n||dr,a)}function yf(e){switch(e){case 5126:return hf;case 35664:return mf;case 35665:return _f;case 35666:return gf;case 35674:return bf;case 35675:return vf;case 35676:return Ef;case 5124:case 35670:return Sf;case 35667:case 35671:return Tf;case 35668:case 35672:return xf;case 35669:case 35673:return Mf;case 5125:return Af;case 36294:return Rf;case 36295:return Cf;case 36296:return wf;case 35678:case 36198:case 36298:case 36306:case 35682:return Pf;case 35679:case 36299:case 36307:return Lf;case 35680:case 36300:case 36308:case 36293:return Df;case 36289:case 36303:case 36311:case 36292:return Uf}}function If(e,n){e.uniform1fv(this.addr,n)}function Nf(e,n){const t=sn(n,this.size,2);e.uniform2fv(this.addr,t)}function Of(e,n){const t=sn(n,this.size,3);e.uniform3fv(this.addr,t)}function Ff(e,n){const t=sn(n,this.size,4);e.uniform4fv(this.addr,t)}function Gf(e,n){const t=sn(n,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function Bf(e,n){const t=sn(n,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function kf(e,n){const t=sn(n,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function Hf(e,n){e.uniform1iv(this.addr,n)}function Vf(e,n){e.uniform2iv(this.addr,n)}function zf(e,n){e.uniform3iv(this.addr,n)}function Wf(e,n){e.uniform4iv(this.addr,n)}function Xf(e,n){e.uniform1uiv(this.addr,n)}function jf(e,n){e.uniform2uiv(this.addr,n)}function qf(e,n){e.uniform3uiv(this.addr,n)}function Kf(e,n){e.uniform4uiv(this.addr,n)}function Yf(e,n,t){const i=this.cache,a=n.length,r=Fn(t,a);it(i,r)||(e.uniform1iv(this.addr,r),at(i,r));for(let o=0;o!==a;++o)t.setTexture2D(n[o]||fr,r[o])}function Qf(e,n,t){const i=this.cache,a=n.length,r=Fn(t,a);it(i,r)||(e.uniform1iv(this.addr,r),at(i,r));for(let o=0;o!==a;++o)t.setTexture3D(n[o]||ur,r[o])}function Jf(e,n,t){const i=this.cache,a=n.length,r=Fn(t,a);it(i,r)||(e.uniform1iv(this.addr,r),at(i,r));for(let o=0;o!==a;++o)t.setTextureCube(n[o]||pr,r[o])}function Zf(e,n,t){const i=this.cache,a=n.length,r=Fn(t,a);it(i,r)||(e.uniform1iv(this.addr,r),at(i,r));for(let o=0;o!==a;++o)t.setTexture2DArray(n[o]||dr,r[o])}function $f(e){switch(e){case 5126:return If;case 35664:return Nf;case 35665:return Of;case 35666:return Ff;case 35674:return Gf;case 35675:return Bf;case 35676:return kf;case 5124:case 35670:return Hf;case 35667:case 35671:return Vf;case 35668:case 35672:return zf;case 35669:case 35673:return Wf;case 5125:return Xf;case 36294:return jf;case 36295:return qf;case 36296:return Kf;case 35678:case 36198:case 36298:case 36306:case 35682:return Yf;case 35679:case 36299:case 36307:return Qf;case 35680:case 36300:case 36308:case 36293:return Jf;case 36289:case 36303:case 36311:case 36292:return Zf}}class ed{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.setValue=yf(t.type)}}class td{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$f(t.type)}}class nd{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,t,i){const a=this.seq;for(let r=0,o=a.length;r!==o;++r){const s=a[r];s.setValue(n,t[s.id],i)}}}const Zn=/(\w+)(\])?(\[|\.)?/g;function Sa(e,n){e.seq.push(n),e.map[n.id]=n}function id(e,n,t){const i=e.name,a=i.length;for(Zn.lastIndex=0;;){const r=Zn.exec(i),o=Zn.lastIndex;let s=r[1];const l=r[2]==="]",f=r[3];if(l&&(s=s|0),f===void 0||f==="["&&o+2===a){Sa(t,f===void 0?new ed(s,e,n):new td(s,e,n));break}else{let p=t.map[s];p===void 0&&(p=new nd(s),Sa(t,p)),t=p}}}class wn{constructor(n,t){this.seq=[],this.map={};const i=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const r=n.getActiveUniform(t,a),o=n.getUniformLocation(t,r.name);id(r,o,this)}}setValue(n,t,i,a){const r=this.map[t];r!==void 0&&r.setValue(n,i,a)}setOptional(n,t,i){const a=t[i];a!==void 0&&this.setValue(n,i,a)}static upload(n,t,i,a){for(let r=0,o=t.length;r!==o;++r){const s=t[r],l=i[s.id];l.needsUpdate!==!1&&s.setValue(n,l.value,a)}}static seqWithValue(n,t){const i=[];for(let a=0,r=n.length;a!==r;++a){const o=n[a];o.id in t&&i.push(o)}return i}}function Ta(e,n,t){const i=e.createShader(n);return e.shaderSource(i,t),e.compileShader(i),i}const ad=37297;let rd=0;function od(e,n){const t=e.split(`
`),i=[],a=Math.max(n-6,0),r=Math.min(n+6,t.length);for(let o=a;o<r;o++){const s=o+1;i.push(`${s===n?">":" "} ${s}: ${t[o]}`)}return i.join(`
`)}const xa=new Be;function sd(e){Je._getMatrix(xa,Je.workingColorSpace,e);const n=`mat3( ${xa.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(e)){case tr:return[n,"LinearTransferOETF"];case Ke:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",e),[n,"LinearTransferOETF"]}}function Ma(e,n,t){const i=e.getShaderParameter(n,e.COMPILE_STATUS),a=e.getShaderInfoLog(n).trim();if(i&&a==="")return"";const r=/ERROR: 0:(\d+)/.exec(a);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+a+`

`+od(e.getShaderSource(n),o)}else return a}function cd(e,n){const t=sd(n);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function ld(e,n){let t;switch(n){case No:t="Linear";break;case Io:t="Reinhard";break;case yo:t="Cineon";break;case Uo:t="ACESFilmic";break;case Do:t="AgX";break;case Lo:t="Neutral";break;case Po:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",n),t="Linear"}return"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const xn=new De;function fd(){Je.getLuminanceCoefficients(xn);const e=xn.x.toFixed(4),n=xn.y.toFixed(4),t=xn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${n}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function dd(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(pn).join(`
`)}function ud(e){const n=[];for(const t in e){const i=e[t];i!==!1&&n.push("#define "+t+" "+i)}return n.join(`
`)}function pd(e,n){const t={},i=e.getProgramParameter(n,e.ACTIVE_ATTRIBUTES);for(let a=0;a<i;a++){const r=e.getActiveAttrib(n,a),o=r.name;let s=1;r.type===e.FLOAT_MAT2&&(s=2),r.type===e.FLOAT_MAT3&&(s=3),r.type===e.FLOAT_MAT4&&(s=4),t[o]={type:r.type,location:e.getAttribLocation(n,o),locationSize:s}}return t}function pn(e){return e!==""}function Aa(e,n){const t=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows)}function Ra(e,n){return e.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}const hd=/^[ \t]*#include +<([\w\d./]+)>/gm;function pi(e){return e.replace(hd,_d)}const md=new Map;function _d(e,n){let t=we[n];if(t===void 0){const i=md.get(n);if(i!==void 0)t=we[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',n,i);else throw new Error("Can not resolve #include <"+n+">")}return pi(t)}const gd=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ca(e){return e.replace(gd,bd)}function bd(e,n,t,i){let a="";for(let r=parseInt(n);r<parseInt(t);r++)a+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return a}function wa(e){let n=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?n+=`
#define HIGH_PRECISION`:e.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}function vd(e){let n="SHADOWMAP_TYPE_BASIC";return e.shadowMapType===za?n="SHADOWMAP_TYPE_PCF":e.shadowMapType===wo?n="SHADOWMAP_TYPE_PCF_SOFT":e.shadowMapType===Ct&&(n="SHADOWMAP_TYPE_VSM"),n}function Ed(e){let n="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case bn:case on:n="ENVMAP_TYPE_CUBE";break;case On:n="ENVMAP_TYPE_CUBE_UV";break}return n}function Sd(e){let n="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case on:n="ENVMAP_MODE_REFRACTION";break}return n}function Td(e){let n="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case Ho:n="ENVMAP_BLENDING_MULTIPLY";break;case ko:n="ENVMAP_BLENDING_MIX";break;case Bo:n="ENVMAP_BLENDING_ADD";break}return n}function xd(e){const n=e.envMapCubeUVHeight;if(n===null)return null;const t=Math.log2(n)-2,i=1/n;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Md(e,n,t,i){const a=e.getContext(),r=t.defines;let o=t.vertexShader,s=t.fragmentShader;const l=vd(t),f=Ed(t),m=Sd(t),p=Td(t),_=xd(t),S=dd(t),C=ud(r),A=a.createProgram();let u,c,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,C].filter(pn).join(`
`),u.length>0&&(u+=`
`),c=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,C].filter(pn).join(`
`),c.length>0&&(c+=`
`)):(u=[wa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,C,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pn).join(`
`),c=[wa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,C,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.envMap?"#define "+m:"",t.envMap?"#define "+p:"",_?"#define CUBEUV_TEXEL_WIDTH "+_.texelWidth:"",_?"#define CUBEUV_TEXEL_HEIGHT "+_.texelHeight:"",_?"#define CUBEUV_MAX_MIP "+_.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Nt?"#define TONE_MAPPING":"",t.toneMapping!==Nt?we.tonemapping_pars_fragment:"",t.toneMapping!==Nt?ld("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",we.colorspace_pars_fragment,cd("linearToOutputTexel",t.outputColorSpace),fd(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(pn).join(`
`)),o=pi(o),o=Aa(o,t),o=Ra(o,t),s=pi(s),s=Aa(s,t),s=Ra(s,t),o=Ca(o),s=Ca(s),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,u=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+u,c=["#define varying in",t.glslVersion===aa?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===aa?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+c);const T=x+u+o,b=x+c+s,N=Ta(a,a.VERTEX_SHADER,T),L=Ta(a,a.FRAGMENT_SHADER,b);a.attachShader(A,N),a.attachShader(A,L),t.index0AttributeName!==void 0?a.bindAttribLocation(A,0,t.index0AttributeName):t.morphTargets===!0&&a.bindAttribLocation(A,0,"position"),a.linkProgram(A);function U(D){if(e.debug.checkShaderErrors){const j=a.getProgramInfoLog(A).trim(),H=a.getShaderInfoLog(N).trim(),q=a.getShaderInfoLog(L).trim();let J=!0,z=!0;if(a.getProgramParameter(A,a.LINK_STATUS)===!1)if(J=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(a,A,N,L);else{const $=Ma(a,N,"vertex"),B=Ma(a,L,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(A,a.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+j+`
`+$+`
`+B)}else j!==""?console.warn("THREE.WebGLProgram: Program Info Log:",j):(H===""||q==="")&&(z=!1);z&&(D.diagnostics={runnable:J,programLog:j,vertexShader:{log:H,prefix:u},fragmentShader:{log:q,prefix:c}})}a.deleteShader(N),a.deleteShader(L),G=new wn(a,A),v=pd(a,A)}let G;this.getUniforms=function(){return G===void 0&&U(this),G};let v;this.getAttributes=function(){return v===void 0&&U(this),v};let g=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return g===!1&&(g=a.getProgramParameter(A,ad)),g},this.destroy=function(){i.releaseStatesOfProgram(this),a.deleteProgram(A),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=rd++,this.cacheKey=n,this.usedTimes=1,this.program=A,this.vertexShader=N,this.fragmentShader=L,this}let Ad=0;class Rd{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n){const t=n.vertexShader,i=n.fragmentShader,a=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(n);return o.has(a)===!1&&(o.add(a),a.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(n){const t=this.materialCache.get(n);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(n),this}getVertexShaderID(n){return this._getShaderStage(n.vertexShader).id}getFragmentShaderID(n){return this._getShaderStage(n.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){const t=this.materialCache;let i=t.get(n);return i===void 0&&(i=new Set,t.set(n,i)),i}_getShaderStage(n){const t=this.shaderCache;let i=t.get(n);return i===void 0&&(i=new Cd(n),t.set(n,i)),i}}class Cd{constructor(n){this.id=Ad++,this.code=n,this.usedTimes=0}}function wd(e,n,t,i,a,r,o){const s=new Co,l=new Rd,f=new Set,m=[],p=a.logarithmicDepthBuffer,_=a.vertexTextures;let S=a.precision;const C={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function A(v){return f.add(v),v===0?"uv":`uv${v}`}function u(v,g,D,j,H){const q=j.fog,J=H.geometry,z=v.isMeshStandardMaterial?j.environment:null,$=(v.isMeshStandardMaterial?t:n).get(v.envMap||z),B=$&&$.mapping===On?$.image.height:null,me=C[v.type];v.precision!==null&&(S=a.getMaxPrecision(v.precision),S!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",S,"instead."));const Ee=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Pe=Ee!==void 0?Ee.length:0;let Ve=0;J.morphAttributes.position!==void 0&&(Ve=1),J.morphAttributes.normal!==void 0&&(Ve=2),J.morphAttributes.color!==void 0&&(Ve=3);let Ze,V,Z,ue;if(me){const Xe=St[me];Ze=Xe.vertexShader,V=Xe.fragmentShader}else Ze=v.vertexShader,V=v.fragmentShader,l.update(v),Z=l.getVertexShaderID(v),ue=l.getFragmentShaderID(v);const ie=e.getRenderTarget(),ve=e.state.buffers.depth.getReversed(),He=H.isInstancedMesh===!0,Te=H.isBatchedMesh===!0,tt=!!v.map,Qe=!!v.matcap,Ue=!!$,M=!!v.aoMap,ht=!!v.lightMap,ye=!!v.bumpMap,Ie=!!v.normalMap,_e=!!v.displacementMap,qe=!!v.emissiveMap,he=!!v.metalnessMap,E=!!v.roughnessMap,d=v.anisotropy>0,y=v.clearcoat>0,W=v.dispersion>0,K=v.iridescence>0,k=v.sheen>0,pe=v.transmission>0,ae=d&&!!v.anisotropyMap,ce=y&&!!v.clearcoatMap,Oe=y&&!!v.clearcoatNormalMap,Q=y&&!!v.clearcoatRoughnessMap,le=K&&!!v.iridescenceMap,Se=K&&!!v.iridescenceThicknessMap,xe=k&&!!v.sheenColorMap,fe=k&&!!v.sheenRoughnessMap,Ne=!!v.specularMap,Ce=!!v.specularColorMap,je=!!v.specularIntensityMap,R=pe&&!!v.transmissionMap,te=pe&&!!v.thicknessMap,F=!!v.gradientMap,X=!!v.alphaMap,oe=v.alphaTest>0,re=!!v.alphaHash,Re=!!v.extensions;let $e=Nt;v.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&($e=e.toneMapping);const ot={shaderID:me,shaderType:v.type,shaderName:v.name,vertexShader:Ze,fragmentShader:V,defines:v.defines,customVertexShaderID:Z,customFragmentShaderID:ue,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:S,batching:Te,batchingColor:Te&&H._colorsTexture!==null,instancing:He,instancingColor:He&&H.instanceColor!==null,instancingMorph:He&&H.morphTexture!==null,supportsVertexTextures:_,outputColorSpace:ie===null?e.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:ut,alphaToCoverage:!!v.alphaToCoverage,map:tt,matcap:Qe,envMap:Ue,envMapMode:Ue&&$.mapping,envMapCubeUVHeight:B,aoMap:M,lightMap:ht,bumpMap:ye,normalMap:Ie,displacementMap:_&&_e,emissiveMap:qe,normalMapObjectSpace:Ie&&v.normalMapType===xo,normalMapTangentSpace:Ie&&v.normalMapType===To,metalnessMap:he,roughnessMap:E,anisotropy:d,anisotropyMap:ae,clearcoat:y,clearcoatMap:ce,clearcoatNormalMap:Oe,clearcoatRoughnessMap:Q,dispersion:W,iridescence:K,iridescenceMap:le,iridescenceThicknessMap:Se,sheen:k,sheenColorMap:xe,sheenRoughnessMap:fe,specularMap:Ne,specularColorMap:Ce,specularIntensityMap:je,transmission:pe,transmissionMap:R,thicknessMap:te,gradientMap:F,opaque:v.transparent===!1&&v.blending===Rn&&v.alphaToCoverage===!1,alphaMap:X,alphaTest:oe,alphaHash:re,combine:v.combine,mapUv:tt&&A(v.map.channel),aoMapUv:M&&A(v.aoMap.channel),lightMapUv:ht&&A(v.lightMap.channel),bumpMapUv:ye&&A(v.bumpMap.channel),normalMapUv:Ie&&A(v.normalMap.channel),displacementMapUv:_e&&A(v.displacementMap.channel),emissiveMapUv:qe&&A(v.emissiveMap.channel),metalnessMapUv:he&&A(v.metalnessMap.channel),roughnessMapUv:E&&A(v.roughnessMap.channel),anisotropyMapUv:ae&&A(v.anisotropyMap.channel),clearcoatMapUv:ce&&A(v.clearcoatMap.channel),clearcoatNormalMapUv:Oe&&A(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&A(v.clearcoatRoughnessMap.channel),iridescenceMapUv:le&&A(v.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&A(v.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&A(v.sheenColorMap.channel),sheenRoughnessMapUv:fe&&A(v.sheenRoughnessMap.channel),specularMapUv:Ne&&A(v.specularMap.channel),specularColorMapUv:Ce&&A(v.specularColorMap.channel),specularIntensityMapUv:je&&A(v.specularIntensityMap.channel),transmissionMapUv:R&&A(v.transmissionMap.channel),thicknessMapUv:te&&A(v.thicknessMap.channel),alphaMapUv:X&&A(v.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(Ie||d),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!J.attributes.uv&&(tt||X),fog:!!q,useFog:v.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:ve,skinning:H.isSkinnedMesh===!0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:Pe,morphTextureStride:Ve,numDirLights:g.directional.length,numPointLights:g.point.length,numSpotLights:g.spot.length,numSpotLightMaps:g.spotLightMap.length,numRectAreaLights:g.rectArea.length,numHemiLights:g.hemi.length,numDirLightShadows:g.directionalShadowMap.length,numPointLightShadows:g.pointShadowMap.length,numSpotLightShadows:g.spotShadowMap.length,numSpotLightShadowsWithMaps:g.numSpotLightShadowsWithMaps,numLightProbes:g.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:e.shadowMap.enabled&&D.length>0,shadowMapType:e.shadowMap.type,toneMapping:$e,decodeVideoTexture:tt&&v.map.isVideoTexture===!0&&Je.getTransfer(v.map.colorSpace)===Ke,decodeVideoTextureEmissive:qe&&v.emissiveMap.isVideoTexture===!0&&Je.getTransfer(v.emissiveMap.colorSpace)===Ke,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===xt,flipSided:v.side===bt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Re&&v.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Re&&v.extensions.multiDraw===!0||Te)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return ot.vertexUv1s=f.has(1),ot.vertexUv2s=f.has(2),ot.vertexUv3s=f.has(3),f.clear(),ot}function c(v){const g=[];if(v.shaderID?g.push(v.shaderID):(g.push(v.customVertexShaderID),g.push(v.customFragmentShaderID)),v.defines!==void 0)for(const D in v.defines)g.push(D),g.push(v.defines[D]);return v.isRawShaderMaterial===!1&&(x(g,v),T(g,v),g.push(e.outputColorSpace)),g.push(v.customProgramCacheKey),g.join()}function x(v,g){v.push(g.precision),v.push(g.outputColorSpace),v.push(g.envMapMode),v.push(g.envMapCubeUVHeight),v.push(g.mapUv),v.push(g.alphaMapUv),v.push(g.lightMapUv),v.push(g.aoMapUv),v.push(g.bumpMapUv),v.push(g.normalMapUv),v.push(g.displacementMapUv),v.push(g.emissiveMapUv),v.push(g.metalnessMapUv),v.push(g.roughnessMapUv),v.push(g.anisotropyMapUv),v.push(g.clearcoatMapUv),v.push(g.clearcoatNormalMapUv),v.push(g.clearcoatRoughnessMapUv),v.push(g.iridescenceMapUv),v.push(g.iridescenceThicknessMapUv),v.push(g.sheenColorMapUv),v.push(g.sheenRoughnessMapUv),v.push(g.specularMapUv),v.push(g.specularColorMapUv),v.push(g.specularIntensityMapUv),v.push(g.transmissionMapUv),v.push(g.thicknessMapUv),v.push(g.combine),v.push(g.fogExp2),v.push(g.sizeAttenuation),v.push(g.morphTargetsCount),v.push(g.morphAttributeCount),v.push(g.numDirLights),v.push(g.numPointLights),v.push(g.numSpotLights),v.push(g.numSpotLightMaps),v.push(g.numHemiLights),v.push(g.numRectAreaLights),v.push(g.numDirLightShadows),v.push(g.numPointLightShadows),v.push(g.numSpotLightShadows),v.push(g.numSpotLightShadowsWithMaps),v.push(g.numLightProbes),v.push(g.shadowMapType),v.push(g.toneMapping),v.push(g.numClippingPlanes),v.push(g.numClipIntersection),v.push(g.depthPacking)}function T(v,g){s.disableAll(),g.supportsVertexTextures&&s.enable(0),g.instancing&&s.enable(1),g.instancingColor&&s.enable(2),g.instancingMorph&&s.enable(3),g.matcap&&s.enable(4),g.envMap&&s.enable(5),g.normalMapObjectSpace&&s.enable(6),g.normalMapTangentSpace&&s.enable(7),g.clearcoat&&s.enable(8),g.iridescence&&s.enable(9),g.alphaTest&&s.enable(10),g.vertexColors&&s.enable(11),g.vertexAlphas&&s.enable(12),g.vertexUv1s&&s.enable(13),g.vertexUv2s&&s.enable(14),g.vertexUv3s&&s.enable(15),g.vertexTangents&&s.enable(16),g.anisotropy&&s.enable(17),g.alphaHash&&s.enable(18),g.batching&&s.enable(19),g.dispersion&&s.enable(20),g.batchingColor&&s.enable(21),v.push(s.mask),s.disableAll(),g.fog&&s.enable(0),g.useFog&&s.enable(1),g.flatShading&&s.enable(2),g.logarithmicDepthBuffer&&s.enable(3),g.reverseDepthBuffer&&s.enable(4),g.skinning&&s.enable(5),g.morphTargets&&s.enable(6),g.morphNormals&&s.enable(7),g.morphColors&&s.enable(8),g.premultipliedAlpha&&s.enable(9),g.shadowMapEnabled&&s.enable(10),g.doubleSided&&s.enable(11),g.flipSided&&s.enable(12),g.useDepthPacking&&s.enable(13),g.dithering&&s.enable(14),g.transmission&&s.enable(15),g.sheen&&s.enable(16),g.opaque&&s.enable(17),g.pointsUvs&&s.enable(18),g.decodeVideoTexture&&s.enable(19),g.decodeVideoTextureEmissive&&s.enable(20),g.alphaToCoverage&&s.enable(21),v.push(s.mask)}function b(v){const g=C[v.type];let D;if(g){const j=St[g];D=So.clone(j.uniforms)}else D=v.uniforms;return D}function N(v,g){let D;for(let j=0,H=m.length;j<H;j++){const q=m[j];if(q.cacheKey===g){D=q,++D.usedTimes;break}}return D===void 0&&(D=new Md(e,g,v,r),m.push(D)),D}function L(v){if(--v.usedTimes===0){const g=m.indexOf(v);m[g]=m[m.length-1],m.pop(),v.destroy()}}function U(v){l.remove(v)}function G(){l.dispose()}return{getParameters:u,getProgramCacheKey:c,getUniforms:b,acquireProgram:N,releaseProgram:L,releaseShaderCache:U,programs:m,dispose:G}}function Pd(){let e=new WeakMap;function n(o){return e.has(o)}function t(o){let s=e.get(o);return s===void 0&&(s={},e.set(o,s)),s}function i(o){e.delete(o)}function a(o,s,l){e.get(o)[s]=l}function r(){e=new WeakMap}return{has:n,get:t,remove:i,update:a,dispose:r}}function Ld(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.material.id!==n.material.id?e.material.id-n.material.id:e.z!==n.z?e.z-n.z:e.id-n.id}function Pa(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.z!==n.z?n.z-e.z:e.id-n.id}function La(){const e=[];let n=0;const t=[],i=[],a=[];function r(){n=0,t.length=0,i.length=0,a.length=0}function o(p,_,S,C,A,u){let c=e[n];return c===void 0?(c={id:p.id,object:p,geometry:_,material:S,groupOrder:C,renderOrder:p.renderOrder,z:A,group:u},e[n]=c):(c.id=p.id,c.object=p,c.geometry=_,c.material=S,c.groupOrder=C,c.renderOrder=p.renderOrder,c.z=A,c.group=u),n++,c}function s(p,_,S,C,A,u){const c=o(p,_,S,C,A,u);S.transmission>0?i.push(c):S.transparent===!0?a.push(c):t.push(c)}function l(p,_,S,C,A,u){const c=o(p,_,S,C,A,u);S.transmission>0?i.unshift(c):S.transparent===!0?a.unshift(c):t.unshift(c)}function f(p,_){t.length>1&&t.sort(p||Ld),i.length>1&&i.sort(_||Pa),a.length>1&&a.sort(_||Pa)}function m(){for(let p=n,_=e.length;p<_;p++){const S=e[p];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:i,transparent:a,init:r,push:s,unshift:l,finish:m,sort:f}}function Dd(){let e=new WeakMap;function n(i,a){const r=e.get(i);let o;return r===void 0?(o=new La,e.set(i,[o])):a>=r.length?(o=new La,r.push(o)):o=r[a],o}function t(){e=new WeakMap}return{get:n,dispose:t}}function Ud(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={direction:new De,color:new ke};break;case"SpotLight":t={position:new De,direction:new De,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new De,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new De,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new De,halfWidth:new De,halfHeight:new De};break}return e[n.id]=t,t}}}function yd(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[n.id]=t,t}}}let Id=0;function Nd(e,n){return(n.castShadow?2:0)-(e.castShadow?2:0)+(n.map?1:0)-(e.map?1:0)}function Od(e){const n=new Ud,t=yd(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)i.probe.push(new De);const a=new De,r=new Mt,o=new Mt;function s(f){let m=0,p=0,_=0;for(let v=0;v<9;v++)i.probe[v].set(0,0,0);let S=0,C=0,A=0,u=0,c=0,x=0,T=0,b=0,N=0,L=0,U=0;f.sort(Nd);for(let v=0,g=f.length;v<g;v++){const D=f[v],j=D.color,H=D.intensity,q=D.distance,J=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)m+=j.r*H,p+=j.g*H,_+=j.b*H;else if(D.isLightProbe){for(let z=0;z<9;z++)i.probe[z].addScaledVector(D.sh.coefficients[z],H);U++}else if(D.isDirectionalLight){const z=n.get(D);if(z.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const $=D.shadow,B=t.get(D);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,i.directionalShadow[S]=B,i.directionalShadowMap[S]=J,i.directionalShadowMatrix[S]=D.shadow.matrix,x++}i.directional[S]=z,S++}else if(D.isSpotLight){const z=n.get(D);z.position.setFromMatrixPosition(D.matrixWorld),z.color.copy(j).multiplyScalar(H),z.distance=q,z.coneCos=Math.cos(D.angle),z.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),z.decay=D.decay,i.spot[A]=z;const $=D.shadow;if(D.map&&(i.spotLightMap[N]=D.map,N++,$.updateMatrices(D),D.castShadow&&L++),i.spotLightMatrix[A]=$.matrix,D.castShadow){const B=t.get(D);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,i.spotShadow[A]=B,i.spotShadowMap[A]=J,b++}A++}else if(D.isRectAreaLight){const z=n.get(D);z.color.copy(j).multiplyScalar(H),z.halfWidth.set(D.width*.5,0,0),z.halfHeight.set(0,D.height*.5,0),i.rectArea[u]=z,u++}else if(D.isPointLight){const z=n.get(D);if(z.color.copy(D.color).multiplyScalar(D.intensity),z.distance=D.distance,z.decay=D.decay,D.castShadow){const $=D.shadow,B=t.get(D);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,B.shadowCameraNear=$.camera.near,B.shadowCameraFar=$.camera.far,i.pointShadow[C]=B,i.pointShadowMap[C]=J,i.pointShadowMatrix[C]=D.shadow.matrix,T++}i.point[C]=z,C++}else if(D.isHemisphereLight){const z=n.get(D);z.skyColor.copy(D.color).multiplyScalar(H),z.groundColor.copy(D.groundColor).multiplyScalar(H),i.hemi[c]=z,c++}}u>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ee.LTC_FLOAT_1,i.rectAreaLTC2=ee.LTC_FLOAT_2):(i.rectAreaLTC1=ee.LTC_HALF_1,i.rectAreaLTC2=ee.LTC_HALF_2)),i.ambient[0]=m,i.ambient[1]=p,i.ambient[2]=_;const G=i.hash;(G.directionalLength!==S||G.pointLength!==C||G.spotLength!==A||G.rectAreaLength!==u||G.hemiLength!==c||G.numDirectionalShadows!==x||G.numPointShadows!==T||G.numSpotShadows!==b||G.numSpotMaps!==N||G.numLightProbes!==U)&&(i.directional.length=S,i.spot.length=A,i.rectArea.length=u,i.point.length=C,i.hemi.length=c,i.directionalShadow.length=x,i.directionalShadowMap.length=x,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=x,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=b+N-L,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=L,i.numLightProbes=U,G.directionalLength=S,G.pointLength=C,G.spotLength=A,G.rectAreaLength=u,G.hemiLength=c,G.numDirectionalShadows=x,G.numPointShadows=T,G.numSpotShadows=b,G.numSpotMaps=N,G.numLightProbes=U,i.version=Id++)}function l(f,m){let p=0,_=0,S=0,C=0,A=0;const u=m.matrixWorldInverse;for(let c=0,x=f.length;c<x;c++){const T=f[c];if(T.isDirectionalLight){const b=i.directional[p];b.direction.setFromMatrixPosition(T.matrixWorld),a.setFromMatrixPosition(T.target.matrixWorld),b.direction.sub(a),b.direction.transformDirection(u),p++}else if(T.isSpotLight){const b=i.spot[S];b.position.setFromMatrixPosition(T.matrixWorld),b.position.applyMatrix4(u),b.direction.setFromMatrixPosition(T.matrixWorld),a.setFromMatrixPosition(T.target.matrixWorld),b.direction.sub(a),b.direction.transformDirection(u),S++}else if(T.isRectAreaLight){const b=i.rectArea[C];b.position.setFromMatrixPosition(T.matrixWorld),b.position.applyMatrix4(u),o.identity(),r.copy(T.matrixWorld),r.premultiply(u),o.extractRotation(r),b.halfWidth.set(T.width*.5,0,0),b.halfHeight.set(0,T.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),C++}else if(T.isPointLight){const b=i.point[_];b.position.setFromMatrixPosition(T.matrixWorld),b.position.applyMatrix4(u),_++}else if(T.isHemisphereLight){const b=i.hemi[A];b.direction.setFromMatrixPosition(T.matrixWorld),b.direction.transformDirection(u),A++}}}return{setup:s,setupView:l,state:i}}function Da(e){const n=new Od(e),t=[],i=[];function a(m){f.camera=m,t.length=0,i.length=0}function r(m){t.push(m)}function o(m){i.push(m)}function s(){n.setup(t)}function l(m){n.setupView(t,m)}const f={lightsArray:t,shadowsArray:i,camera:null,lights:n,transmissionRenderTarget:{}};return{init:a,state:f,setupLights:s,setupLightsView:l,pushLight:r,pushShadow:o}}function Fd(e){let n=new WeakMap;function t(a,r=0){const o=n.get(a);let s;return o===void 0?(s=new Da(e),n.set(a,[s])):r>=o.length?(s=new Da(e),o.push(s)):s=o[r],s}function i(){n=new WeakMap}return{get:t,dispose:i}}const Gd=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Bd=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function kd(e,n,t){let i=new Fa;const a=new st,r=new st,o=new dt,s=new io({depthPacking:ao}),l=new ro,f={},m=t.maxTextureSize,p={[an]:bt,[bt]:an,[xt]:xt},_=new Yt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new st},radius:{value:4}},vertexShader:Gd,fragmentShader:Bd}),S=_.clone();S.defines.HORIZONTAL_PASS=1;const C=new Nn;C.setAttribute("position",new yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const A=new Dt(C,_),u=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=za;let c=this.type;this.render=function(L,U,G){if(u.enabled===!1||u.autoUpdate===!1&&u.needsUpdate===!1||L.length===0)return;const v=e.getRenderTarget(),g=e.getActiveCubeFace(),D=e.getActiveMipmapLevel(),j=e.state;j.setBlending(qt),j.buffers.color.setClear(1,1,1,1),j.buffers.depth.setTest(!0),j.setScissorTest(!1);const H=c!==Ct&&this.type===Ct,q=c===Ct&&this.type!==Ct;for(let J=0,z=L.length;J<z;J++){const $=L[J],B=$.shadow;if(B===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;a.copy(B.mapSize);const me=B.getFrameExtents();if(a.multiply(me),r.copy(B.mapSize),(a.x>m||a.y>m)&&(a.x>m&&(r.x=Math.floor(m/me.x),a.x=r.x*me.x,B.mapSize.x=r.x),a.y>m&&(r.y=Math.floor(m/me.y),a.y=r.y*me.y,B.mapSize.y=r.y)),B.map===null||H===!0||q===!0){const Pe=this.type!==Ct?{minFilter:jt,magFilter:jt}:{};B.map!==null&&B.map.dispose(),B.map=new nn(a.x,a.y,Pe),B.map.texture.name=$.name+".shadowMap",B.camera.updateProjectionMatrix()}e.setRenderTarget(B.map),e.clear();const Ee=B.getViewportCount();for(let Pe=0;Pe<Ee;Pe++){const Ve=B.getViewport(Pe);o.set(r.x*Ve.x,r.y*Ve.y,r.x*Ve.z,r.y*Ve.w),j.viewport(o),B.updateMatrices($,Pe),i=B.getFrustum(),b(U,G,B.camera,$,this.type)}B.isPointLightShadow!==!0&&this.type===Ct&&x(B,G),B.needsUpdate=!1}c=this.type,u.needsUpdate=!1,e.setRenderTarget(v,g,D)};function x(L,U){const G=n.update(A);_.defines.VSM_SAMPLES!==L.blurSamples&&(_.defines.VSM_SAMPLES=L.blurSamples,S.defines.VSM_SAMPLES=L.blurSamples,_.needsUpdate=!0,S.needsUpdate=!0),L.mapPass===null&&(L.mapPass=new nn(a.x,a.y)),_.uniforms.shadow_pass.value=L.map.texture,_.uniforms.resolution.value=L.mapSize,_.uniforms.radius.value=L.radius,e.setRenderTarget(L.mapPass),e.clear(),e.renderBufferDirect(U,null,G,_,A,null),S.uniforms.shadow_pass.value=L.mapPass.texture,S.uniforms.resolution.value=L.mapSize,S.uniforms.radius.value=L.radius,e.setRenderTarget(L.map),e.clear(),e.renderBufferDirect(U,null,G,S,A,null)}function T(L,U,G,v){let g=null;const D=G.isPointLight===!0?L.customDistanceMaterial:L.customDepthMaterial;if(D!==void 0)g=D;else if(g=G.isPointLight===!0?l:s,e.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0){const j=g.uuid,H=U.uuid;let q=f[j];q===void 0&&(q={},f[j]=q);let J=q[H];J===void 0&&(J=g.clone(),q[H]=J,U.addEventListener("dispose",N)),g=J}if(g.visible=U.visible,g.wireframe=U.wireframe,v===Ct?g.side=U.shadowSide!==null?U.shadowSide:U.side:g.side=U.shadowSide!==null?U.shadowSide:p[U.side],g.alphaMap=U.alphaMap,g.alphaTest=U.alphaTest,g.map=U.map,g.clipShadows=U.clipShadows,g.clippingPlanes=U.clippingPlanes,g.clipIntersection=U.clipIntersection,g.displacementMap=U.displacementMap,g.displacementScale=U.displacementScale,g.displacementBias=U.displacementBias,g.wireframeLinewidth=U.wireframeLinewidth,g.linewidth=U.linewidth,G.isPointLight===!0&&g.isMeshDistanceMaterial===!0){const j=e.properties.get(g);j.light=G}return g}function b(L,U,G,v,g){if(L.visible===!1)return;if(L.layers.test(U.layers)&&(L.isMesh||L.isLine||L.isPoints)&&(L.castShadow||L.receiveShadow&&g===Ct)&&(!L.frustumCulled||i.intersectsObject(L))){L.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,L.matrixWorld);const H=n.update(L),q=L.material;if(Array.isArray(q)){const J=H.groups;for(let z=0,$=J.length;z<$;z++){const B=J[z],me=q[B.materialIndex];if(me&&me.visible){const Ee=T(L,me,v,g);L.onBeforeShadow(e,L,U,G,H,Ee,B),e.renderBufferDirect(G,null,H,Ee,L,B),L.onAfterShadow(e,L,U,G,H,Ee,B)}}}else if(q.visible){const J=T(L,q,v,g);L.onBeforeShadow(e,L,U,G,H,J,null),e.renderBufferDirect(G,null,H,J,L,null),L.onAfterShadow(e,L,U,G,H,J,null)}}const j=L.children;for(let H=0,q=j.length;H<q;H++)b(j[H],U,G,v,g)}function N(L){L.target.removeEventListener("dispose",N);for(const G in f){const v=f[G],g=L.target.uuid;g in v&&(v[g].dispose(),delete v[g])}}}const Hd={[li]:ci,[si]:ai,[oi]:ii,[Ln]:ri,[ci]:li,[ai]:si,[ii]:oi,[ri]:Ln};function Vd(e,n){function t(){let R=!1;const te=new dt;let F=null;const X=new dt(0,0,0,0);return{setMask:function(oe){F!==oe&&!R&&(e.colorMask(oe,oe,oe,oe),F=oe)},setLocked:function(oe){R=oe},setClear:function(oe,re,Re,$e,ot){ot===!0&&(oe*=$e,re*=$e,Re*=$e),te.set(oe,re,Re,$e),X.equals(te)===!1&&(e.clearColor(oe,re,Re,$e),X.copy(te))},reset:function(){R=!1,F=null,X.set(-1,0,0,0)}}}function i(){let R=!1,te=!1,F=null,X=null,oe=null;return{setReversed:function(re){if(te!==re){const Re=n.get("EXT_clip_control");te?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT);const $e=oe;oe=null,this.setClear($e)}te=re},getReversed:function(){return te},setTest:function(re){re?ie(e.DEPTH_TEST):ve(e.DEPTH_TEST)},setMask:function(re){F!==re&&!R&&(e.depthMask(re),F=re)},setFunc:function(re){if(te&&(re=Hd[re]),X!==re){switch(re){case li:e.depthFunc(e.NEVER);break;case ci:e.depthFunc(e.ALWAYS);break;case si:e.depthFunc(e.LESS);break;case Ln:e.depthFunc(e.LEQUAL);break;case oi:e.depthFunc(e.EQUAL);break;case ri:e.depthFunc(e.GEQUAL);break;case ai:e.depthFunc(e.GREATER);break;case ii:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}X=re}},setLocked:function(re){R=re},setClear:function(re){oe!==re&&(te&&(re=1-re),e.clearDepth(re),oe=re)},reset:function(){R=!1,F=null,X=null,oe=null,te=!1}}}function a(){let R=!1,te=null,F=null,X=null,oe=null,re=null,Re=null,$e=null,ot=null;return{setTest:function(Xe){R||(Xe?ie(e.STENCIL_TEST):ve(e.STENCIL_TEST))},setMask:function(Xe){te!==Xe&&!R&&(e.stencilMask(Xe),te=Xe)},setFunc:function(Xe,vt,Rt){(F!==Xe||X!==vt||oe!==Rt)&&(e.stencilFunc(Xe,vt,Rt),F=Xe,X=vt,oe=Rt)},setOp:function(Xe,vt,Rt){(re!==Xe||Re!==vt||$e!==Rt)&&(e.stencilOp(Xe,vt,Rt),re=Xe,Re=vt,$e=Rt)},setLocked:function(Xe){R=Xe},setClear:function(Xe){ot!==Xe&&(e.clearStencil(Xe),ot=Xe)},reset:function(){R=!1,te=null,F=null,X=null,oe=null,re=null,Re=null,$e=null,ot=null}}}const r=new t,o=new i,s=new a,l=new WeakMap,f=new WeakMap;let m={},p={},_=new WeakMap,S=[],C=null,A=!1,u=null,c=null,x=null,T=null,b=null,N=null,L=null,U=new ke(0,0,0),G=0,v=!1,g=null,D=null,j=null,H=null,q=null;const J=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,$=0;const B=e.getParameter(e.VERSION);B.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(B)[1]),z=$>=1):B.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),z=$>=2);let me=null,Ee={};const Pe=e.getParameter(e.SCISSOR_BOX),Ve=e.getParameter(e.VIEWPORT),Ze=new dt().fromArray(Pe),V=new dt().fromArray(Ve);function Z(R,te,F,X){const oe=new Uint8Array(4),re=e.createTexture();e.bindTexture(R,re),e.texParameteri(R,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(R,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Re=0;Re<F;Re++)R===e.TEXTURE_3D||R===e.TEXTURE_2D_ARRAY?e.texImage3D(te,0,e.RGBA,1,1,X,0,e.RGBA,e.UNSIGNED_BYTE,oe):e.texImage2D(te+Re,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,oe);return re}const ue={};ue[e.TEXTURE_2D]=Z(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=Z(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=Z(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=Z(e.TEXTURE_3D,e.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ie(e.DEPTH_TEST),o.setFunc(Ln),ye(!1),Ie(Zi),ie(e.CULL_FACE),M(qt);function ie(R){m[R]!==!0&&(e.enable(R),m[R]=!0)}function ve(R){m[R]!==!1&&(e.disable(R),m[R]=!1)}function He(R,te){return p[R]!==te?(e.bindFramebuffer(R,te),p[R]=te,R===e.DRAW_FRAMEBUFFER&&(p[e.FRAMEBUFFER]=te),R===e.FRAMEBUFFER&&(p[e.DRAW_FRAMEBUFFER]=te),!0):!1}function Te(R,te){let F=S,X=!1;if(R){F=_.get(te),F===void 0&&(F=[],_.set(te,F));const oe=R.textures;if(F.length!==oe.length||F[0]!==e.COLOR_ATTACHMENT0){for(let re=0,Re=oe.length;re<Re;re++)F[re]=e.COLOR_ATTACHMENT0+re;F.length=oe.length,X=!0}}else F[0]!==e.BACK&&(F[0]=e.BACK,X=!0);X&&e.drawBuffers(F)}function tt(R){return C!==R?(e.useProgram(R),C=R,!0):!1}const Qe={[ln]:e.FUNC_ADD,[yr]:e.FUNC_SUBTRACT,[Ur]:e.FUNC_REVERSE_SUBTRACT};Qe[Vo]=e.MIN,Qe[zo]=e.MAX;const Ue={[Kr]:e.ZERO,[qr]:e.ONE,[jr]:e.SRC_COLOR,[Xr]:e.SRC_ALPHA,[Wr]:e.SRC_ALPHA_SATURATE,[zr]:e.DST_COLOR,[Vr]:e.DST_ALPHA,[Hr]:e.ONE_MINUS_SRC_COLOR,[kr]:e.ONE_MINUS_SRC_ALPHA,[Br]:e.ONE_MINUS_DST_COLOR,[Gr]:e.ONE_MINUS_DST_ALPHA,[Fr]:e.CONSTANT_COLOR,[Or]:e.ONE_MINUS_CONSTANT_COLOR,[Nr]:e.CONSTANT_ALPHA,[Ir]:e.ONE_MINUS_CONSTANT_ALPHA};function M(R,te,F,X,oe,re,Re,$e,ot,Xe){if(R===qt){A===!0&&(ve(e.BLEND),A=!1);return}if(A===!1&&(ie(e.BLEND),A=!0),R!==vo){if(R!==u||Xe!==v){if((c!==ln||b!==ln)&&(e.blendEquation(e.FUNC_ADD),c=ln,b=ln),Xe)switch(R){case Rn:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ta:e.blendFunc(e.ONE,e.ONE);break;case ea:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case $i:e.blendFuncSeparate(e.ZERO,e.SRC_COLOR,e.ZERO,e.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case Rn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ta:e.blendFunc(e.SRC_ALPHA,e.ONE);break;case ea:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case $i:e.blendFunc(e.ZERO,e.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}x=null,T=null,N=null,L=null,U.set(0,0,0),G=0,u=R,v=Xe}return}oe=oe||te,re=re||F,Re=Re||X,(te!==c||oe!==b)&&(e.blendEquationSeparate(Qe[te],Qe[oe]),c=te,b=oe),(F!==x||X!==T||re!==N||Re!==L)&&(e.blendFuncSeparate(Ue[F],Ue[X],Ue[re],Ue[Re]),x=F,T=X,N=re,L=Re),($e.equals(U)===!1||ot!==G)&&(e.blendColor($e.r,$e.g,$e.b,ot),U.copy($e),G=ot),u=R,v=!1}function ht(R,te){R.side===xt?ve(e.CULL_FACE):ie(e.CULL_FACE);let F=R.side===bt;te&&(F=!F),ye(F),R.blending===Rn&&R.transparent===!1?M(qt):M(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),o.setFunc(R.depthFunc),o.setTest(R.depthTest),o.setMask(R.depthWrite),r.setMask(R.colorWrite);const X=R.stencilWrite;s.setTest(X),X&&(s.setMask(R.stencilWriteMask),s.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),s.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),qe(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?ie(e.SAMPLE_ALPHA_TO_COVERAGE):ve(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(R){g!==R&&(R?e.frontFace(e.CW):e.frontFace(e.CCW),g=R)}function Ie(R){R!==go?(ie(e.CULL_FACE),R!==D&&(R===Zi?e.cullFace(e.BACK):R===bo?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):ve(e.CULL_FACE),D=R}function _e(R){R!==j&&(z&&e.lineWidth(R),j=R)}function qe(R,te,F){R?(ie(e.POLYGON_OFFSET_FILL),(H!==te||q!==F)&&(e.polygonOffset(te,F),H=te,q=F)):ve(e.POLYGON_OFFSET_FILL)}function he(R){R?ie(e.SCISSOR_TEST):ve(e.SCISSOR_TEST)}function E(R){R===void 0&&(R=e.TEXTURE0+J-1),me!==R&&(e.activeTexture(R),me=R)}function d(R,te,F){F===void 0&&(me===null?F=e.TEXTURE0+J-1:F=me);let X=Ee[F];X===void 0&&(X={type:void 0,texture:void 0},Ee[F]=X),(X.type!==R||X.texture!==te)&&(me!==F&&(e.activeTexture(F),me=F),e.bindTexture(R,te||ue[R]),X.type=R,X.texture=te)}function y(){const R=Ee[me];R!==void 0&&R.type!==void 0&&(e.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function W(){try{e.compressedTexImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function K(){try{e.compressedTexImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function k(){try{e.texSubImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function pe(){try{e.texSubImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ae(){try{e.compressedTexSubImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ce(){try{e.compressedTexSubImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Oe(){try{e.texStorage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Q(){try{e.texStorage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function le(){try{e.texImage2D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Se(){try{e.texImage3D(...arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function xe(R){Ze.equals(R)===!1&&(e.scissor(R.x,R.y,R.z,R.w),Ze.copy(R))}function fe(R){V.equals(R)===!1&&(e.viewport(R.x,R.y,R.z,R.w),V.copy(R))}function Ne(R,te){let F=f.get(te);F===void 0&&(F=new WeakMap,f.set(te,F));let X=F.get(R);X===void 0&&(X=e.getUniformBlockIndex(te,R.name),F.set(R,X))}function Ce(R,te){const X=f.get(te).get(R);l.get(te)!==X&&(e.uniformBlockBinding(te,X,R.__bindingPointIndex),l.set(te,X))}function je(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),m={},me=null,Ee={},p={},_=new WeakMap,S=[],C=null,A=!1,u=null,c=null,x=null,T=null,b=null,N=null,L=null,U=new ke(0,0,0),G=0,v=!1,g=null,D=null,j=null,H=null,q=null,Ze.set(0,0,e.canvas.width,e.canvas.height),V.set(0,0,e.canvas.width,e.canvas.height),r.reset(),o.reset(),s.reset()}return{buffers:{color:r,depth:o,stencil:s},enable:ie,disable:ve,bindFramebuffer:He,drawBuffers:Te,useProgram:tt,setBlending:M,setMaterial:ht,setFlipSided:ye,setCullFace:Ie,setLineWidth:_e,setPolygonOffset:qe,setScissorTest:he,activeTexture:E,bindTexture:d,unbindTexture:y,compressedTexImage2D:W,compressedTexImage3D:K,texImage2D:le,texImage3D:Se,updateUBOMapping:Ne,uniformBlockBinding:Ce,texStorage2D:Oe,texStorage3D:Q,texSubImage2D:k,texSubImage3D:pe,compressedTexSubImage2D:ae,compressedTexSubImage3D:ce,scissor:xe,viewport:fe,reset:je}}function zd(e,n,t,i,a,r,o){const s=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new st,m=new WeakMap;let p;const _=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function C(E,d){return S?new OffscreenCanvas(E,d):Go("canvas")}function A(E,d,y){let W=1;const K=he(E);if((K.width>y||K.height>y)&&(W=y/Math.max(K.width,K.height)),W<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const k=Math.floor(W*K.width),pe=Math.floor(W*K.height);p===void 0&&(p=C(k,pe));const ae=d?C(k,pe):p;return ae.width=k,ae.height=pe,ae.getContext("2d").drawImage(E,0,0,k,pe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+k+"x"+pe+")."),ae}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),E;return E}function u(E){return E.generateMipmaps}function c(E){e.generateMipmap(E)}function x(E){return E.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?e.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function T(E,d,y,W,K=!1){if(E!==null){if(e[E]!==void 0)return e[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let k=d;if(d===e.RED&&(y===e.FLOAT&&(k=e.R32F),y===e.HALF_FLOAT&&(k=e.R16F),y===e.UNSIGNED_BYTE&&(k=e.R8)),d===e.RED_INTEGER&&(y===e.UNSIGNED_BYTE&&(k=e.R8UI),y===e.UNSIGNED_SHORT&&(k=e.R16UI),y===e.UNSIGNED_INT&&(k=e.R32UI),y===e.BYTE&&(k=e.R8I),y===e.SHORT&&(k=e.R16I),y===e.INT&&(k=e.R32I)),d===e.RG&&(y===e.FLOAT&&(k=e.RG32F),y===e.HALF_FLOAT&&(k=e.RG16F),y===e.UNSIGNED_BYTE&&(k=e.RG8)),d===e.RG_INTEGER&&(y===e.UNSIGNED_BYTE&&(k=e.RG8UI),y===e.UNSIGNED_SHORT&&(k=e.RG16UI),y===e.UNSIGNED_INT&&(k=e.RG32UI),y===e.BYTE&&(k=e.RG8I),y===e.SHORT&&(k=e.RG16I),y===e.INT&&(k=e.RG32I)),d===e.RGB_INTEGER&&(y===e.UNSIGNED_BYTE&&(k=e.RGB8UI),y===e.UNSIGNED_SHORT&&(k=e.RGB16UI),y===e.UNSIGNED_INT&&(k=e.RGB32UI),y===e.BYTE&&(k=e.RGB8I),y===e.SHORT&&(k=e.RGB16I),y===e.INT&&(k=e.RGB32I)),d===e.RGBA_INTEGER&&(y===e.UNSIGNED_BYTE&&(k=e.RGBA8UI),y===e.UNSIGNED_SHORT&&(k=e.RGBA16UI),y===e.UNSIGNED_INT&&(k=e.RGBA32UI),y===e.BYTE&&(k=e.RGBA8I),y===e.SHORT&&(k=e.RGBA16I),y===e.INT&&(k=e.RGBA32I)),d===e.RGB&&y===e.UNSIGNED_INT_5_9_9_9_REV&&(k=e.RGB9_E5),d===e.RGBA){const pe=K?tr:Je.getTransfer(W);y===e.FLOAT&&(k=e.RGBA32F),y===e.HALF_FLOAT&&(k=e.RGBA16F),y===e.UNSIGNED_BYTE&&(k=pe===Ke?e.SRGB8_ALPHA8:e.RGBA8),y===e.UNSIGNED_SHORT_4_4_4_4&&(k=e.RGBA4),y===e.UNSIGNED_SHORT_5_5_5_1&&(k=e.RGB5_A1)}return(k===e.R16F||k===e.R32F||k===e.RG16F||k===e.RG32F||k===e.RGBA16F||k===e.RGBA32F)&&n.get("EXT_color_buffer_float"),k}function b(E,d){let y;return E?d===null||d===gn||d===_n?y=e.DEPTH24_STENCIL8:d===Xt?y=e.DEPTH32F_STENCIL8:d===Un&&(y=e.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):d===null||d===gn||d===_n?y=e.DEPTH_COMPONENT24:d===Xt?y=e.DEPTH_COMPONENT32F:d===Un&&(y=e.DEPTH_COMPONENT16),y}function N(E,d){return u(E)===!0||E.isFramebufferTexture&&E.minFilter!==jt&&E.minFilter!==Lt?Math.log2(Math.max(d.width,d.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?d.mipmaps.length:1}function L(E){const d=E.target;d.removeEventListener("dispose",L),G(d),d.isVideoTexture&&m.delete(d)}function U(E){const d=E.target;d.removeEventListener("dispose",U),g(d)}function G(E){const d=i.get(E);if(d.__webglInit===void 0)return;const y=E.source,W=_.get(y);if(W){const K=W[d.__cacheKey];K.usedTimes--,K.usedTimes===0&&v(E),Object.keys(W).length===0&&_.delete(y)}i.remove(E)}function v(E){const d=i.get(E);e.deleteTexture(d.__webglTexture);const y=E.source,W=_.get(y);delete W[d.__cacheKey],o.memory.textures--}function g(E){const d=i.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),i.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(d.__webglFramebuffer[W]))for(let K=0;K<d.__webglFramebuffer[W].length;K++)e.deleteFramebuffer(d.__webglFramebuffer[W][K]);else e.deleteFramebuffer(d.__webglFramebuffer[W]);d.__webglDepthbuffer&&e.deleteRenderbuffer(d.__webglDepthbuffer[W])}else{if(Array.isArray(d.__webglFramebuffer))for(let W=0;W<d.__webglFramebuffer.length;W++)e.deleteFramebuffer(d.__webglFramebuffer[W]);else e.deleteFramebuffer(d.__webglFramebuffer);if(d.__webglDepthbuffer&&e.deleteRenderbuffer(d.__webglDepthbuffer),d.__webglMultisampledFramebuffer&&e.deleteFramebuffer(d.__webglMultisampledFramebuffer),d.__webglColorRenderbuffer)for(let W=0;W<d.__webglColorRenderbuffer.length;W++)d.__webglColorRenderbuffer[W]&&e.deleteRenderbuffer(d.__webglColorRenderbuffer[W]);d.__webglDepthRenderbuffer&&e.deleteRenderbuffer(d.__webglDepthRenderbuffer)}const y=E.textures;for(let W=0,K=y.length;W<K;W++){const k=i.get(y[W]);k.__webglTexture&&(e.deleteTexture(k.__webglTexture),o.memory.textures--),i.remove(y[W])}i.remove(E)}let D=0;function j(){D=0}function H(){const E=D;return E>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+a.maxTextures),D+=1,E}function q(E){const d=[];return d.push(E.wrapS),d.push(E.wrapT),d.push(E.wrapR||0),d.push(E.magFilter),d.push(E.minFilter),d.push(E.anisotropy),d.push(E.internalFormat),d.push(E.format),d.push(E.type),d.push(E.generateMipmaps),d.push(E.premultiplyAlpha),d.push(E.flipY),d.push(E.unpackAlignment),d.push(E.colorSpace),d.join()}function J(E,d){const y=i.get(E);if(E.isVideoTexture&&_e(E),E.isRenderTargetTexture===!1&&E.version>0&&y.__version!==E.version){const W=E.image;if(W===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{V(y,E,d);return}}t.bindTexture(e.TEXTURE_2D,y.__webglTexture,e.TEXTURE0+d)}function z(E,d){const y=i.get(E);if(E.version>0&&y.__version!==E.version){V(y,E,d);return}t.bindTexture(e.TEXTURE_2D_ARRAY,y.__webglTexture,e.TEXTURE0+d)}function $(E,d){const y=i.get(E);if(E.version>0&&y.__version!==E.version){V(y,E,d);return}t.bindTexture(e.TEXTURE_3D,y.__webglTexture,e.TEXTURE0+d)}function B(E,d){const y=i.get(E);if(E.version>0&&y.__version!==E.version){Z(y,E,d);return}t.bindTexture(e.TEXTURE_CUBE_MAP,y.__webglTexture,e.TEXTURE0+d)}const me={[Dn]:e.REPEAT,[ka]:e.CLAMP_TO_EDGE,[Ba]:e.MIRRORED_REPEAT},Ee={[jt]:e.NEAREST,[Ha]:e.NEAREST_MIPMAP_NEAREST,[un]:e.NEAREST_MIPMAP_LINEAR,[Lt]:e.LINEAR,[An]:e.LINEAR_MIPMAP_NEAREST,[Wt]:e.LINEAR_MIPMAP_LINEAR},Pe={[to]:e.NEVER,[eo]:e.ALWAYS,[$r]:e.LESS,[Va]:e.LEQUAL,[Zr]:e.EQUAL,[Jr]:e.GEQUAL,[Qr]:e.GREATER,[Yr]:e.NOTEQUAL};function Ve(E,d){if(d.type===Xt&&n.has("OES_texture_float_linear")===!1&&(d.magFilter===Lt||d.magFilter===An||d.magFilter===un||d.magFilter===Wt||d.minFilter===Lt||d.minFilter===An||d.minFilter===un||d.minFilter===Wt)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(E,e.TEXTURE_WRAP_S,me[d.wrapS]),e.texParameteri(E,e.TEXTURE_WRAP_T,me[d.wrapT]),(E===e.TEXTURE_3D||E===e.TEXTURE_2D_ARRAY)&&e.texParameteri(E,e.TEXTURE_WRAP_R,me[d.wrapR]),e.texParameteri(E,e.TEXTURE_MAG_FILTER,Ee[d.magFilter]),e.texParameteri(E,e.TEXTURE_MIN_FILTER,Ee[d.minFilter]),d.compareFunction&&(e.texParameteri(E,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(E,e.TEXTURE_COMPARE_FUNC,Pe[d.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(d.magFilter===jt||d.minFilter!==un&&d.minFilter!==Wt||d.type===Xt&&n.has("OES_texture_float_linear")===!1)return;if(d.anisotropy>1||i.get(d).__currentAnisotropy){const y=n.get("EXT_texture_filter_anisotropic");e.texParameterf(E,y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(d.anisotropy,a.getMaxAnisotropy())),i.get(d).__currentAnisotropy=d.anisotropy}}}function Ze(E,d){let y=!1;E.__webglInit===void 0&&(E.__webglInit=!0,d.addEventListener("dispose",L));const W=d.source;let K=_.get(W);K===void 0&&(K={},_.set(W,K));const k=q(d);if(k!==E.__cacheKey){K[k]===void 0&&(K[k]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,y=!0),K[k].usedTimes++;const pe=K[E.__cacheKey];pe!==void 0&&(K[E.__cacheKey].usedTimes--,pe.usedTimes===0&&v(d)),E.__cacheKey=k,E.__webglTexture=K[k].texture}return y}function V(E,d,y){let W=e.TEXTURE_2D;(d.isDataArrayTexture||d.isCompressedArrayTexture)&&(W=e.TEXTURE_2D_ARRAY),d.isData3DTexture&&(W=e.TEXTURE_3D);const K=Ze(E,d),k=d.source;t.bindTexture(W,E.__webglTexture,e.TEXTURE0+y);const pe=i.get(k);if(k.version!==pe.__version||K===!0){t.activeTexture(e.TEXTURE0+y);const ae=Je.getPrimaries(Je.workingColorSpace),ce=d.colorSpace===Zt?null:Je.getPrimaries(d.colorSpace),Oe=d.colorSpace===Zt||ae===ce?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,d.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,d.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,d.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe);let Q=A(d.image,!1,a.maxTextureSize);Q=qe(d,Q);const le=r.convert(d.format,d.colorSpace),Se=r.convert(d.type);let xe=T(d.internalFormat,le,Se,d.colorSpace,d.isVideoTexture);Ve(W,d);let fe;const Ne=d.mipmaps,Ce=d.isVideoTexture!==!0,je=pe.__version===void 0||K===!0,R=k.dataReady,te=N(d,Q);if(d.isDepthTexture)xe=b(d.format===Pn,d.type),je&&(Ce?t.texStorage2D(e.TEXTURE_2D,1,xe,Q.width,Q.height):t.texImage2D(e.TEXTURE_2D,0,xe,Q.width,Q.height,0,le,Se,null));else if(d.isDataTexture)if(Ne.length>0){Ce&&je&&t.texStorage2D(e.TEXTURE_2D,te,xe,Ne[0].width,Ne[0].height);for(let F=0,X=Ne.length;F<X;F++)fe=Ne[F],Ce?R&&t.texSubImage2D(e.TEXTURE_2D,F,0,0,fe.width,fe.height,le,Se,fe.data):t.texImage2D(e.TEXTURE_2D,F,xe,fe.width,fe.height,0,le,Se,fe.data);d.generateMipmaps=!1}else Ce?(je&&t.texStorage2D(e.TEXTURE_2D,te,xe,Q.width,Q.height),R&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,Q.width,Q.height,le,Se,Q.data)):t.texImage2D(e.TEXTURE_2D,0,xe,Q.width,Q.height,0,le,Se,Q.data);else if(d.isCompressedTexture)if(d.isCompressedArrayTexture){Ce&&je&&t.texStorage3D(e.TEXTURE_2D_ARRAY,te,xe,Ne[0].width,Ne[0].height,Q.depth);for(let F=0,X=Ne.length;F<X;F++)if(fe=Ne[F],d.format!==Pt)if(le!==null)if(Ce){if(R)if(d.layerUpdates.size>0){const oe=ia(fe.width,fe.height,d.format,d.type);for(const re of d.layerUpdates){const Re=fe.data.subarray(re*oe/fe.data.BYTES_PER_ELEMENT,(re+1)*oe/fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,F,0,0,re,fe.width,fe.height,1,le,Re)}d.clearLayerUpdates()}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,F,0,0,0,fe.width,fe.height,Q.depth,le,fe.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,F,xe,fe.width,fe.height,Q.depth,0,fe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ce?R&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,F,0,0,0,fe.width,fe.height,Q.depth,le,Se,fe.data):t.texImage3D(e.TEXTURE_2D_ARRAY,F,xe,fe.width,fe.height,Q.depth,0,le,Se,fe.data)}else{Ce&&je&&t.texStorage2D(e.TEXTURE_2D,te,xe,Ne[0].width,Ne[0].height);for(let F=0,X=Ne.length;F<X;F++)fe=Ne[F],d.format!==Pt?le!==null?Ce?R&&t.compressedTexSubImage2D(e.TEXTURE_2D,F,0,0,fe.width,fe.height,le,fe.data):t.compressedTexImage2D(e.TEXTURE_2D,F,xe,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ce?R&&t.texSubImage2D(e.TEXTURE_2D,F,0,0,fe.width,fe.height,le,Se,fe.data):t.texImage2D(e.TEXTURE_2D,F,xe,fe.width,fe.height,0,le,Se,fe.data)}else if(d.isDataArrayTexture)if(Ce){if(je&&t.texStorage3D(e.TEXTURE_2D_ARRAY,te,xe,Q.width,Q.height,Q.depth),R)if(d.layerUpdates.size>0){const F=ia(Q.width,Q.height,d.format,d.type);for(const X of d.layerUpdates){const oe=Q.data.subarray(X*F/Q.data.BYTES_PER_ELEMENT,(X+1)*F/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,X,Q.width,Q.height,1,le,Se,oe)}d.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,le,Se,Q.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,xe,Q.width,Q.height,Q.depth,0,le,Se,Q.data);else if(d.isData3DTexture)Ce?(je&&t.texStorage3D(e.TEXTURE_3D,te,xe,Q.width,Q.height,Q.depth),R&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,le,Se,Q.data)):t.texImage3D(e.TEXTURE_3D,0,xe,Q.width,Q.height,Q.depth,0,le,Se,Q.data);else if(d.isFramebufferTexture){if(je)if(Ce)t.texStorage2D(e.TEXTURE_2D,te,xe,Q.width,Q.height);else{let F=Q.width,X=Q.height;for(let oe=0;oe<te;oe++)t.texImage2D(e.TEXTURE_2D,oe,xe,F,X,0,le,Se,null),F>>=1,X>>=1}}else if(Ne.length>0){if(Ce&&je){const F=he(Ne[0]);t.texStorage2D(e.TEXTURE_2D,te,xe,F.width,F.height)}for(let F=0,X=Ne.length;F<X;F++)fe=Ne[F],Ce?R&&t.texSubImage2D(e.TEXTURE_2D,F,0,0,le,Se,fe):t.texImage2D(e.TEXTURE_2D,F,xe,le,Se,fe);d.generateMipmaps=!1}else if(Ce){if(je){const F=he(Q);t.texStorage2D(e.TEXTURE_2D,te,xe,F.width,F.height)}R&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,le,Se,Q)}else t.texImage2D(e.TEXTURE_2D,0,xe,le,Se,Q);u(d)&&c(W),pe.__version=k.version,d.onUpdate&&d.onUpdate(d)}E.__version=d.version}function Z(E,d,y){if(d.image.length!==6)return;const W=Ze(E,d),K=d.source;t.bindTexture(e.TEXTURE_CUBE_MAP,E.__webglTexture,e.TEXTURE0+y);const k=i.get(K);if(K.version!==k.__version||W===!0){t.activeTexture(e.TEXTURE0+y);const pe=Je.getPrimaries(Je.workingColorSpace),ae=d.colorSpace===Zt?null:Je.getPrimaries(d.colorSpace),ce=d.colorSpace===Zt||pe===ae?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,d.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,d.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,d.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce);const Oe=d.isCompressedTexture||d.image[0].isCompressedTexture,Q=d.image[0]&&d.image[0].isDataTexture,le=[];for(let X=0;X<6;X++)!Oe&&!Q?le[X]=A(d.image[X],!0,a.maxCubemapSize):le[X]=Q?d.image[X].image:d.image[X],le[X]=qe(d,le[X]);const Se=le[0],xe=r.convert(d.format,d.colorSpace),fe=r.convert(d.type),Ne=T(d.internalFormat,xe,fe,d.colorSpace),Ce=d.isVideoTexture!==!0,je=k.__version===void 0||W===!0,R=K.dataReady;let te=N(d,Se);Ve(e.TEXTURE_CUBE_MAP,d);let F;if(Oe){Ce&&je&&t.texStorage2D(e.TEXTURE_CUBE_MAP,te,Ne,Se.width,Se.height);for(let X=0;X<6;X++){F=le[X].mipmaps;for(let oe=0;oe<F.length;oe++){const re=F[oe];d.format!==Pt?xe!==null?Ce?R&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe,0,0,re.width,re.height,xe,re.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe,Ne,re.width,re.height,0,re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ce?R&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe,0,0,re.width,re.height,xe,fe,re.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe,Ne,re.width,re.height,0,xe,fe,re.data)}}}else{if(F=d.mipmaps,Ce&&je){F.length>0&&te++;const X=he(le[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,te,Ne,X.width,X.height)}for(let X=0;X<6;X++)if(Q){Ce?R&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,le[X].width,le[X].height,xe,fe,le[X].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Ne,le[X].width,le[X].height,0,xe,fe,le[X].data);for(let oe=0;oe<F.length;oe++){const Re=F[oe].image[X].image;Ce?R&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe+1,0,0,Re.width,Re.height,xe,fe,Re.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe+1,Ne,Re.width,Re.height,0,xe,fe,Re.data)}}else{Ce?R&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,xe,fe,le[X]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Ne,xe,fe,le[X]);for(let oe=0;oe<F.length;oe++){const re=F[oe];Ce?R&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe+1,0,0,xe,fe,re.image[X]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,oe+1,Ne,xe,fe,re.image[X])}}}u(d)&&c(e.TEXTURE_CUBE_MAP),k.__version=K.version,d.onUpdate&&d.onUpdate(d)}E.__version=d.version}function ue(E,d,y,W,K,k){const pe=r.convert(y.format,y.colorSpace),ae=r.convert(y.type),ce=T(y.internalFormat,pe,ae,y.colorSpace),Oe=i.get(d),Q=i.get(y);if(Q.__renderTarget=d,!Oe.__hasExternalTextures){const le=Math.max(1,d.width>>k),Se=Math.max(1,d.height>>k);K===e.TEXTURE_3D||K===e.TEXTURE_2D_ARRAY?t.texImage3D(K,k,ce,le,Se,d.depth,0,pe,ae,null):t.texImage2D(K,k,ce,le,Se,0,pe,ae,null)}t.bindFramebuffer(e.FRAMEBUFFER,E),Ie(d)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,W,K,Q.__webglTexture,0,ye(d)):(K===e.TEXTURE_2D||K>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,W,K,Q.__webglTexture,k),t.bindFramebuffer(e.FRAMEBUFFER,null)}function ie(E,d,y){if(e.bindRenderbuffer(e.RENDERBUFFER,E),d.depthBuffer){const W=d.depthTexture,K=W&&W.isDepthTexture?W.type:null,k=b(d.stencilBuffer,K),pe=d.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ae=ye(d);Ie(d)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ae,k,d.width,d.height):y?e.renderbufferStorageMultisample(e.RENDERBUFFER,ae,k,d.width,d.height):e.renderbufferStorage(e.RENDERBUFFER,k,d.width,d.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,pe,e.RENDERBUFFER,E)}else{const W=d.textures;for(let K=0;K<W.length;K++){const k=W[K],pe=r.convert(k.format,k.colorSpace),ae=r.convert(k.type),ce=T(k.internalFormat,pe,ae,k.colorSpace),Oe=ye(d);y&&Ie(d)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,Oe,ce,d.width,d.height):Ie(d)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Oe,ce,d.width,d.height):e.renderbufferStorage(e.RENDERBUFFER,ce,d.width,d.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ve(E,d){if(d&&d.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(e.FRAMEBUFFER,E),!(d.depthTexture&&d.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const W=i.get(d.depthTexture);W.__renderTarget=d,(!W.__webglTexture||d.depthTexture.image.width!==d.width||d.depthTexture.image.height!==d.height)&&(d.depthTexture.image.width=d.width,d.depthTexture.image.height=d.height,d.depthTexture.needsUpdate=!0),J(d.depthTexture,0);const K=W.__webglTexture,k=ye(d);if(d.depthTexture.format===_i)Ie(d)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,K,0,k):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,K,0);else if(d.depthTexture.format===Pn)Ie(d)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,K,0,k):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function He(E){const d=i.get(E),y=E.isWebGLCubeRenderTarget===!0;if(d.__boundDepthTexture!==E.depthTexture){const W=E.depthTexture;if(d.__depthDisposeCallback&&d.__depthDisposeCallback(),W){const K=()=>{delete d.__boundDepthTexture,delete d.__depthDisposeCallback,W.removeEventListener("dispose",K)};W.addEventListener("dispose",K),d.__depthDisposeCallback=K}d.__boundDepthTexture=W}if(E.depthTexture&&!d.__autoAllocateDepthBuffer){if(y)throw new Error("target.depthTexture not supported in Cube render targets");ve(d.__webglFramebuffer,E)}else if(y){d.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(e.FRAMEBUFFER,d.__webglFramebuffer[W]),d.__webglDepthbuffer[W]===void 0)d.__webglDepthbuffer[W]=e.createRenderbuffer(),ie(d.__webglDepthbuffer[W],E,!1);else{const K=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,k=d.__webglDepthbuffer[W];e.bindRenderbuffer(e.RENDERBUFFER,k),e.framebufferRenderbuffer(e.FRAMEBUFFER,K,e.RENDERBUFFER,k)}}else if(t.bindFramebuffer(e.FRAMEBUFFER,d.__webglFramebuffer),d.__webglDepthbuffer===void 0)d.__webglDepthbuffer=e.createRenderbuffer(),ie(d.__webglDepthbuffer,E,!1);else{const W=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,K=d.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,K),e.framebufferRenderbuffer(e.FRAMEBUFFER,W,e.RENDERBUFFER,K)}t.bindFramebuffer(e.FRAMEBUFFER,null)}function Te(E,d,y){const W=i.get(E);d!==void 0&&ue(W.__webglFramebuffer,E,E.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),y!==void 0&&He(E)}function tt(E){const d=E.texture,y=i.get(E),W=i.get(d);E.addEventListener("dispose",U);const K=E.textures,k=E.isWebGLCubeRenderTarget===!0,pe=K.length>1;if(pe||(W.__webglTexture===void 0&&(W.__webglTexture=e.createTexture()),W.__version=d.version,o.memory.textures++),k){y.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(d.mipmaps&&d.mipmaps.length>0){y.__webglFramebuffer[ae]=[];for(let ce=0;ce<d.mipmaps.length;ce++)y.__webglFramebuffer[ae][ce]=e.createFramebuffer()}else y.__webglFramebuffer[ae]=e.createFramebuffer()}else{if(d.mipmaps&&d.mipmaps.length>0){y.__webglFramebuffer=[];for(let ae=0;ae<d.mipmaps.length;ae++)y.__webglFramebuffer[ae]=e.createFramebuffer()}else y.__webglFramebuffer=e.createFramebuffer();if(pe)for(let ae=0,ce=K.length;ae<ce;ae++){const Oe=i.get(K[ae]);Oe.__webglTexture===void 0&&(Oe.__webglTexture=e.createTexture(),o.memory.textures++)}if(E.samples>0&&Ie(E)===!1){y.__webglMultisampledFramebuffer=e.createFramebuffer(),y.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,y.__webglMultisampledFramebuffer);for(let ae=0;ae<K.length;ae++){const ce=K[ae];y.__webglColorRenderbuffer[ae]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,y.__webglColorRenderbuffer[ae]);const Oe=r.convert(ce.format,ce.colorSpace),Q=r.convert(ce.type),le=T(ce.internalFormat,Oe,Q,ce.colorSpace,E.isXRRenderTarget===!0),Se=ye(E);e.renderbufferStorageMultisample(e.RENDERBUFFER,Se,le,E.width,E.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ae,e.RENDERBUFFER,y.__webglColorRenderbuffer[ae])}e.bindRenderbuffer(e.RENDERBUFFER,null),E.depthBuffer&&(y.__webglDepthRenderbuffer=e.createRenderbuffer(),ie(y.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(k){t.bindTexture(e.TEXTURE_CUBE_MAP,W.__webglTexture),Ve(e.TEXTURE_CUBE_MAP,d);for(let ae=0;ae<6;ae++)if(d.mipmaps&&d.mipmaps.length>0)for(let ce=0;ce<d.mipmaps.length;ce++)ue(y.__webglFramebuffer[ae][ce],E,d,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ae,ce);else ue(y.__webglFramebuffer[ae],E,d,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);u(d)&&c(e.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(pe){for(let ae=0,ce=K.length;ae<ce;ae++){const Oe=K[ae],Q=i.get(Oe);t.bindTexture(e.TEXTURE_2D,Q.__webglTexture),Ve(e.TEXTURE_2D,Oe),ue(y.__webglFramebuffer,E,Oe,e.COLOR_ATTACHMENT0+ae,e.TEXTURE_2D,0),u(Oe)&&c(e.TEXTURE_2D)}t.unbindTexture()}else{let ae=e.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(ae=E.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(ae,W.__webglTexture),Ve(ae,d),d.mipmaps&&d.mipmaps.length>0)for(let ce=0;ce<d.mipmaps.length;ce++)ue(y.__webglFramebuffer[ce],E,d,e.COLOR_ATTACHMENT0,ae,ce);else ue(y.__webglFramebuffer,E,d,e.COLOR_ATTACHMENT0,ae,0);u(d)&&c(ae),t.unbindTexture()}E.depthBuffer&&He(E)}function Qe(E){const d=E.textures;for(let y=0,W=d.length;y<W;y++){const K=d[y];if(u(K)){const k=x(E),pe=i.get(K).__webglTexture;t.bindTexture(k,pe),c(k),t.unbindTexture()}}}const Ue=[],M=[];function ht(E){if(E.samples>0){if(Ie(E)===!1){const d=E.textures,y=E.width,W=E.height;let K=e.COLOR_BUFFER_BIT;const k=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,pe=i.get(E),ae=d.length>1;if(ae)for(let ce=0;ce<d.length;ce++)t.bindFramebuffer(e.FRAMEBUFFER,pe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ce,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,pe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ce,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,pe.__webglMultisampledFramebuffer),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,pe.__webglFramebuffer);for(let ce=0;ce<d.length;ce++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(K|=e.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(K|=e.STENCIL_BUFFER_BIT)),ae){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,pe.__webglColorRenderbuffer[ce]);const Oe=i.get(d[ce]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Oe,0)}e.blitFramebuffer(0,0,y,W,0,0,y,W,K,e.NEAREST),l===!0&&(Ue.length=0,M.length=0,Ue.push(e.COLOR_ATTACHMENT0+ce),E.depthBuffer&&E.resolveDepthBuffer===!1&&(Ue.push(k),M.push(k),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,M)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ue))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),ae)for(let ce=0;ce<d.length;ce++){t.bindFramebuffer(e.FRAMEBUFFER,pe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ce,e.RENDERBUFFER,pe.__webglColorRenderbuffer[ce]);const Oe=i.get(d[ce]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,pe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+ce,e.TEXTURE_2D,Oe,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,pe.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){const d=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[d])}}}function ye(E){return Math.min(a.maxSamples,E.samples)}function Ie(E){const d=i.get(E);return E.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&d.__useRenderToTexture!==!1}function _e(E){const d=o.render.frame;m.get(E)!==d&&(m.set(E,d),E.update())}function qe(E,d){const y=E.colorSpace,W=E.format,K=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||y!==ut&&y!==Zt&&(Je.getTransfer(y)===Ke?(W!==Pt||K!==Kt)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",y)),d}function he(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(f.width=E.naturalWidth||E.width,f.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(f.width=E.displayWidth,f.height=E.displayHeight):(f.width=E.width,f.height=E.height),f}this.allocateTextureUnit=H,this.resetTextureUnits=j,this.setTexture2D=J,this.setTexture2DArray=z,this.setTexture3D=$,this.setTextureCube=B,this.rebindTextures=Te,this.setupRenderTarget=tt,this.updateRenderTargetMipmap=Qe,this.updateMultisampleRenderTarget=ht,this.setupDepthRenderbuffer=He,this.setupFrameBufferTexture=ue,this.useMultisampledRTT=Ie}function Wd(e,n){function t(i,a=Zt){let r;const o=Je.getTransfer(a);if(i===Kt)return e.UNSIGNED_BYTE;if(i===Wa)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Xa)return e.UNSIGNED_SHORT_5_5_5_1;if(i===oo)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===so)return e.BYTE;if(i===co)return e.SHORT;if(i===Un)return e.UNSIGNED_SHORT;if(i===qa)return e.INT;if(i===gn)return e.UNSIGNED_INT;if(i===Xt)return e.FLOAT;if(i===In)return e.HALF_FLOAT;if(i===lo)return e.ALPHA;if(i===fo)return e.RGB;if(i===Pt)return e.RGBA;if(i===uo)return e.LUMINANCE;if(i===po)return e.LUMINANCE_ALPHA;if(i===_i)return e.DEPTH_COMPONENT;if(i===Pn)return e.DEPTH_STENCIL;if(i===ho)return e.RED;if(i===Ka)return e.RED_INTEGER;if(i===mo)return e.RG;if(i===Ya)return e.RG_INTEGER;if(i===Qa)return e.RGBA_INTEGER;if(i===Hn||i===Vn||i===zn||i===Wn)if(o===Ke)if(r=n.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Hn)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Vn)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===zn)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Wn)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=n.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Hn)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Vn)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===zn)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Wn)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ri||i===Ci||i===wi||i===Pi)if(r=n.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ri)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ci)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===wi)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Pi)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Li||i===Di||i===Ui)if(r=n.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Li||i===Di)return o===Ke?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ui)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===yi||i===Ii||i===Ni||i===Oi||i===Fi||i===Gi||i===Bi||i===ki||i===Hi||i===Vi||i===zi||i===Wi||i===Xi||i===ji)if(r=n.get("WEBGL_compressed_texture_astc"),r!==null){if(i===yi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ii)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ni)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Oi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Fi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Bi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ki)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Hi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Vi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===zi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Wi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Xi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ji)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Xn||i===qi||i===Ki)if(r=n.get("EXT_texture_compression_bptc"),r!==null){if(i===Xn)return o===Ke?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===qi)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ki)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===_o||i===Yi||i===Qi||i===Ji)if(r=n.get("EXT_texture_compression_rgtc"),r!==null){if(i===Xn)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Yi)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Qi)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Ji)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===_n?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:t}}const Xd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jd=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class qd{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,t,i){if(this.texture===null){const a=new rn,r=n.properties.get(a);r.__webglTexture=t.texture,(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=a}}getMesh(n){if(this.texture!==null&&this.mesh===null){const t=n.cameras[0].viewport,i=new Yt({vertexShader:Xd,fragmentShader:jd,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Dt(new ja(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Kd extends Pr{constructor(n,t){super();const i=this;let a=null,r=1,o=null,s="local-floor",l=1,f=null,m=null,p=null,_=null,S=null,C=null;const A=new qd,u=t.getContextAttributes();let c=null,x=null;const T=[],b=[],N=new st;let L=null;const U=new hn;U.viewport=new dt;const G=new hn;G.viewport=new dt;const v=[U,G],g=new Lr;let D=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let Z=T[V];return Z===void 0&&(Z=new kn,T[V]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(V){let Z=T[V];return Z===void 0&&(Z=new kn,T[V]=Z),Z.getGripSpace()},this.getHand=function(V){let Z=T[V];return Z===void 0&&(Z=new kn,T[V]=Z),Z.getHandSpace()};function H(V){const Z=b.indexOf(V.inputSource);if(Z===-1)return;const ue=T[Z];ue!==void 0&&(ue.update(V.inputSource,V.frame,f||o),ue.dispatchEvent({type:V.type,data:V.inputSource}))}function q(){a.removeEventListener("select",H),a.removeEventListener("selectstart",H),a.removeEventListener("selectend",H),a.removeEventListener("squeeze",H),a.removeEventListener("squeezestart",H),a.removeEventListener("squeezeend",H),a.removeEventListener("end",q),a.removeEventListener("inputsourceschange",J);for(let V=0;V<T.length;V++){const Z=b[V];Z!==null&&(b[V]=null,T[V].disconnect(Z))}D=null,j=null,A.reset(),n.setRenderTarget(c),S=null,_=null,p=null,a=null,x=null,Ze.stop(),i.isPresenting=!1,n.setPixelRatio(L),n.setSize(N.width,N.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){r=V,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){s=V,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return f||o},this.setReferenceSpace=function(V){f=V},this.getBaseLayer=function(){return _!==null?_:S},this.getBinding=function(){return p},this.getFrame=function(){return C},this.getSession=function(){return a},this.setSession=async function(V){if(a=V,a!==null){if(c=n.getRenderTarget(),a.addEventListener("select",H),a.addEventListener("selectstart",H),a.addEventListener("selectend",H),a.addEventListener("squeeze",H),a.addEventListener("squeezestart",H),a.addEventListener("squeezeend",H),a.addEventListener("end",q),a.addEventListener("inputsourceschange",J),u.xrCompatible!==!0&&await t.makeXRCompatible(),L=n.getPixelRatio(),n.getSize(N),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let ue=null,ie=null,ve=null;u.depth&&(ve=u.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ue=u.stencil?Pn:_i,ie=u.stencil?_n:gn);const He={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:r};p=new XRWebGLBinding(a,t),_=p.createProjectionLayer(He),a.updateRenderState({layers:[_]}),n.setPixelRatio(1),n.setSize(_.textureWidth,_.textureHeight,!1),x=new nn(_.textureWidth,_.textureHeight,{format:Pt,type:Kt,depthTexture:new Ga(_.textureWidth,_.textureHeight,ie,void 0,void 0,void 0,void 0,void 0,void 0,ue),stencilBuffer:u.stencil,colorSpace:n.outputColorSpace,samples:u.antialias?4:0,resolveDepthBuffer:_.ignoreDepthValues===!1,resolveStencilBuffer:_.ignoreDepthValues===!1})}else{const ue={antialias:u.antialias,alpha:!0,depth:u.depth,stencil:u.stencil,framebufferScaleFactor:r};S=new XRWebGLLayer(a,t,ue),a.updateRenderState({baseLayer:S}),n.setPixelRatio(1),n.setSize(S.framebufferWidth,S.framebufferHeight,!1),x=new nn(S.framebufferWidth,S.framebufferHeight,{format:Pt,type:Kt,colorSpace:n.outputColorSpace,stencilBuffer:u.stencil,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),f=null,o=await a.requestReferenceSpace(s),Ze.setContext(a),Ze.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return A.getDepthTexture()};function J(V){for(let Z=0;Z<V.removed.length;Z++){const ue=V.removed[Z],ie=b.indexOf(ue);ie>=0&&(b[ie]=null,T[ie].disconnect(ue))}for(let Z=0;Z<V.added.length;Z++){const ue=V.added[Z];let ie=b.indexOf(ue);if(ie===-1){for(let He=0;He<T.length;He++)if(He>=b.length){b.push(ue),ie=He;break}else if(b[He]===null){b[He]=ue,ie=He;break}if(ie===-1)break}const ve=T[ie];ve&&ve.connect(ue)}}const z=new De,$=new De;function B(V,Z,ue){z.setFromMatrixPosition(Z.matrixWorld),$.setFromMatrixPosition(ue.matrixWorld);const ie=z.distanceTo($),ve=Z.projectionMatrix.elements,He=ue.projectionMatrix.elements,Te=ve[14]/(ve[10]-1),tt=ve[14]/(ve[10]+1),Qe=(ve[9]+1)/ve[5],Ue=(ve[9]-1)/ve[5],M=(ve[8]-1)/ve[0],ht=(He[8]+1)/He[0],ye=Te*M,Ie=Te*ht,_e=ie/(-M+ht),qe=_e*-M;if(Z.matrixWorld.decompose(V.position,V.quaternion,V.scale),V.translateX(qe),V.translateZ(_e),V.matrixWorld.compose(V.position,V.quaternion,V.scale),V.matrixWorldInverse.copy(V.matrixWorld).invert(),ve[10]===-1)V.projectionMatrix.copy(Z.projectionMatrix),V.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const he=Te+_e,E=tt+_e,d=ye-qe,y=Ie+(ie-qe),W=Qe*tt/E*he,K=Ue*tt/E*he;V.projectionMatrix.makePerspective(d,y,W,K,he,E),V.projectionMatrixInverse.copy(V.projectionMatrix).invert()}}function me(V,Z){Z===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(Z.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(a===null)return;let Z=V.near,ue=V.far;A.texture!==null&&(A.depthNear>0&&(Z=A.depthNear),A.depthFar>0&&(ue=A.depthFar)),g.near=G.near=U.near=Z,g.far=G.far=U.far=ue,(D!==g.near||j!==g.far)&&(a.updateRenderState({depthNear:g.near,depthFar:g.far}),D=g.near,j=g.far),U.layers.mask=V.layers.mask|2,G.layers.mask=V.layers.mask|4,g.layers.mask=U.layers.mask|G.layers.mask;const ie=V.parent,ve=g.cameras;me(g,ie);for(let He=0;He<ve.length;He++)me(ve[He],ie);ve.length===2?B(g,U,G):g.projectionMatrix.copy(U.projectionMatrix),Ee(V,g,ie)};function Ee(V,Z,ue){ue===null?V.matrix.copy(Z.matrixWorld):(V.matrix.copy(ue.matrixWorld),V.matrix.invert(),V.matrix.multiply(Z.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(Z.projectionMatrix),V.projectionMatrixInverse.copy(Z.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=Dr*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return g},this.getFoveation=function(){if(!(_===null&&S===null))return l},this.setFoveation=function(V){l=V,_!==null&&(_.fixedFoveation=V),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=V)},this.hasDepthSensing=function(){return A.texture!==null},this.getDepthSensingMesh=function(){return A.getMesh(g)};let Pe=null;function Ve(V,Z){if(m=Z.getViewerPose(f||o),C=Z,m!==null){const ue=m.views;S!==null&&(n.setRenderTargetFramebuffer(x,S.framebuffer),n.setRenderTarget(x));let ie=!1;ue.length!==g.cameras.length&&(g.cameras.length=0,ie=!0);for(let Te=0;Te<ue.length;Te++){const tt=ue[Te];let Qe=null;if(S!==null)Qe=S.getViewport(tt);else{const M=p.getViewSubImage(_,tt);Qe=M.viewport,Te===0&&(n.setRenderTargetTextures(x,M.colorTexture,_.ignoreDepthValues?void 0:M.depthStencilTexture),n.setRenderTarget(x))}let Ue=v[Te];Ue===void 0&&(Ue=new hn,Ue.layers.enable(Te),Ue.viewport=new dt,v[Te]=Ue),Ue.matrix.fromArray(tt.transform.matrix),Ue.matrix.decompose(Ue.position,Ue.quaternion,Ue.scale),Ue.projectionMatrix.fromArray(tt.projectionMatrix),Ue.projectionMatrixInverse.copy(Ue.projectionMatrix).invert(),Ue.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),Te===0&&(g.matrix.copy(Ue.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale)),ie===!0&&g.cameras.push(Ue)}const ve=a.enabledFeatures;if(ve&&ve.includes("depth-sensing")&&a.depthUsage=="gpu-optimized"&&p){const Te=p.getDepthInformation(ue[0]);Te&&Te.isValid&&Te.texture&&A.init(n,Te,a.renderState)}}for(let ue=0;ue<T.length;ue++){const ie=b[ue],ve=T[ue];ie!==null&&ve!==void 0&&ve.update(ie,Z,f||o)}Pe&&Pe(V,Z),Z.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Z}),C=null}const Ze=new lr;Ze.setAnimationLoop(Ve),this.setAnimationLoop=function(V){Pe=V},this.dispose=function(){}}}const Bt=new er,Yd=new Mt;function Qd(e,n){function t(u,c){u.matrixAutoUpdate===!0&&u.updateMatrix(),c.value.copy(u.matrix)}function i(u,c){c.color.getRGB(u.fogColor.value,Za(e)),c.isFog?(u.fogNear.value=c.near,u.fogFar.value=c.far):c.isFogExp2&&(u.fogDensity.value=c.density)}function a(u,c,x,T,b){c.isMeshBasicMaterial||c.isMeshLambertMaterial?r(u,c):c.isMeshToonMaterial?(r(u,c),p(u,c)):c.isMeshPhongMaterial?(r(u,c),m(u,c)):c.isMeshStandardMaterial?(r(u,c),_(u,c),c.isMeshPhysicalMaterial&&S(u,c,b)):c.isMeshMatcapMaterial?(r(u,c),C(u,c)):c.isMeshDepthMaterial?r(u,c):c.isMeshDistanceMaterial?(r(u,c),A(u,c)):c.isMeshNormalMaterial?r(u,c):c.isLineBasicMaterial?(o(u,c),c.isLineDashedMaterial&&s(u,c)):c.isPointsMaterial?l(u,c,x,T):c.isSpriteMaterial?f(u,c):c.isShadowMaterial?(u.color.value.copy(c.color),u.opacity.value=c.opacity):c.isShaderMaterial&&(c.uniformsNeedUpdate=!1)}function r(u,c){u.opacity.value=c.opacity,c.color&&u.diffuse.value.copy(c.color),c.emissive&&u.emissive.value.copy(c.emissive).multiplyScalar(c.emissiveIntensity),c.map&&(u.map.value=c.map,t(c.map,u.mapTransform)),c.alphaMap&&(u.alphaMap.value=c.alphaMap,t(c.alphaMap,u.alphaMapTransform)),c.bumpMap&&(u.bumpMap.value=c.bumpMap,t(c.bumpMap,u.bumpMapTransform),u.bumpScale.value=c.bumpScale,c.side===bt&&(u.bumpScale.value*=-1)),c.normalMap&&(u.normalMap.value=c.normalMap,t(c.normalMap,u.normalMapTransform),u.normalScale.value.copy(c.normalScale),c.side===bt&&u.normalScale.value.negate()),c.displacementMap&&(u.displacementMap.value=c.displacementMap,t(c.displacementMap,u.displacementMapTransform),u.displacementScale.value=c.displacementScale,u.displacementBias.value=c.displacementBias),c.emissiveMap&&(u.emissiveMap.value=c.emissiveMap,t(c.emissiveMap,u.emissiveMapTransform)),c.specularMap&&(u.specularMap.value=c.specularMap,t(c.specularMap,u.specularMapTransform)),c.alphaTest>0&&(u.alphaTest.value=c.alphaTest);const x=n.get(c),T=x.envMap,b=x.envMapRotation;T&&(u.envMap.value=T,Bt.copy(b),Bt.x*=-1,Bt.y*=-1,Bt.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Bt.y*=-1,Bt.z*=-1),u.envMapRotation.value.setFromMatrix4(Yd.makeRotationFromEuler(Bt)),u.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.reflectivity.value=c.reflectivity,u.ior.value=c.ior,u.refractionRatio.value=c.refractionRatio),c.lightMap&&(u.lightMap.value=c.lightMap,u.lightMapIntensity.value=c.lightMapIntensity,t(c.lightMap,u.lightMapTransform)),c.aoMap&&(u.aoMap.value=c.aoMap,u.aoMapIntensity.value=c.aoMapIntensity,t(c.aoMap,u.aoMapTransform))}function o(u,c){u.diffuse.value.copy(c.color),u.opacity.value=c.opacity,c.map&&(u.map.value=c.map,t(c.map,u.mapTransform))}function s(u,c){u.dashSize.value=c.dashSize,u.totalSize.value=c.dashSize+c.gapSize,u.scale.value=c.scale}function l(u,c,x,T){u.diffuse.value.copy(c.color),u.opacity.value=c.opacity,u.size.value=c.size*x,u.scale.value=T*.5,c.map&&(u.map.value=c.map,t(c.map,u.uvTransform)),c.alphaMap&&(u.alphaMap.value=c.alphaMap,t(c.alphaMap,u.alphaMapTransform)),c.alphaTest>0&&(u.alphaTest.value=c.alphaTest)}function f(u,c){u.diffuse.value.copy(c.color),u.opacity.value=c.opacity,u.rotation.value=c.rotation,c.map&&(u.map.value=c.map,t(c.map,u.mapTransform)),c.alphaMap&&(u.alphaMap.value=c.alphaMap,t(c.alphaMap,u.alphaMapTransform)),c.alphaTest>0&&(u.alphaTest.value=c.alphaTest)}function m(u,c){u.specular.value.copy(c.specular),u.shininess.value=Math.max(c.shininess,1e-4)}function p(u,c){c.gradientMap&&(u.gradientMap.value=c.gradientMap)}function _(u,c){u.metalness.value=c.metalness,c.metalnessMap&&(u.metalnessMap.value=c.metalnessMap,t(c.metalnessMap,u.metalnessMapTransform)),u.roughness.value=c.roughness,c.roughnessMap&&(u.roughnessMap.value=c.roughnessMap,t(c.roughnessMap,u.roughnessMapTransform)),c.envMap&&(u.envMapIntensity.value=c.envMapIntensity)}function S(u,c,x){u.ior.value=c.ior,c.sheen>0&&(u.sheenColor.value.copy(c.sheenColor).multiplyScalar(c.sheen),u.sheenRoughness.value=c.sheenRoughness,c.sheenColorMap&&(u.sheenColorMap.value=c.sheenColorMap,t(c.sheenColorMap,u.sheenColorMapTransform)),c.sheenRoughnessMap&&(u.sheenRoughnessMap.value=c.sheenRoughnessMap,t(c.sheenRoughnessMap,u.sheenRoughnessMapTransform))),c.clearcoat>0&&(u.clearcoat.value=c.clearcoat,u.clearcoatRoughness.value=c.clearcoatRoughness,c.clearcoatMap&&(u.clearcoatMap.value=c.clearcoatMap,t(c.clearcoatMap,u.clearcoatMapTransform)),c.clearcoatRoughnessMap&&(u.clearcoatRoughnessMap.value=c.clearcoatRoughnessMap,t(c.clearcoatRoughnessMap,u.clearcoatRoughnessMapTransform)),c.clearcoatNormalMap&&(u.clearcoatNormalMap.value=c.clearcoatNormalMap,t(c.clearcoatNormalMap,u.clearcoatNormalMapTransform),u.clearcoatNormalScale.value.copy(c.clearcoatNormalScale),c.side===bt&&u.clearcoatNormalScale.value.negate())),c.dispersion>0&&(u.dispersion.value=c.dispersion),c.iridescence>0&&(u.iridescence.value=c.iridescence,u.iridescenceIOR.value=c.iridescenceIOR,u.iridescenceThicknessMinimum.value=c.iridescenceThicknessRange[0],u.iridescenceThicknessMaximum.value=c.iridescenceThicknessRange[1],c.iridescenceMap&&(u.iridescenceMap.value=c.iridescenceMap,t(c.iridescenceMap,u.iridescenceMapTransform)),c.iridescenceThicknessMap&&(u.iridescenceThicknessMap.value=c.iridescenceThicknessMap,t(c.iridescenceThicknessMap,u.iridescenceThicknessMapTransform))),c.transmission>0&&(u.transmission.value=c.transmission,u.transmissionSamplerMap.value=x.texture,u.transmissionSamplerSize.value.set(x.width,x.height),c.transmissionMap&&(u.transmissionMap.value=c.transmissionMap,t(c.transmissionMap,u.transmissionMapTransform)),u.thickness.value=c.thickness,c.thicknessMap&&(u.thicknessMap.value=c.thicknessMap,t(c.thicknessMap,u.thicknessMapTransform)),u.attenuationDistance.value=c.attenuationDistance,u.attenuationColor.value.copy(c.attenuationColor)),c.anisotropy>0&&(u.anisotropyVector.value.set(c.anisotropy*Math.cos(c.anisotropyRotation),c.anisotropy*Math.sin(c.anisotropyRotation)),c.anisotropyMap&&(u.anisotropyMap.value=c.anisotropyMap,t(c.anisotropyMap,u.anisotropyMapTransform))),u.specularIntensity.value=c.specularIntensity,u.specularColor.value.copy(c.specularColor),c.specularColorMap&&(u.specularColorMap.value=c.specularColorMap,t(c.specularColorMap,u.specularColorMapTransform)),c.specularIntensityMap&&(u.specularIntensityMap.value=c.specularIntensityMap,t(c.specularIntensityMap,u.specularIntensityMapTransform))}function C(u,c){c.matcap&&(u.matcap.value=c.matcap)}function A(u,c){const x=n.get(c).light;u.referencePosition.value.setFromMatrixPosition(x.matrixWorld),u.nearDistance.value=x.shadow.camera.near,u.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:a}}function Jd(e,n,t,i){let a={},r={},o=[];const s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,T){const b=T.program;i.uniformBlockBinding(x,b)}function f(x,T){let b=a[x.id];b===void 0&&(C(x),b=m(x),a[x.id]=b,x.addEventListener("dispose",u));const N=T.program;i.updateUBOMapping(x,N);const L=n.render.frame;r[x.id]!==L&&(_(x),r[x.id]=L)}function m(x){const T=p();x.__bindingPointIndex=T;const b=e.createBuffer(),N=x.__size,L=x.usage;return e.bindBuffer(e.UNIFORM_BUFFER,b),e.bufferData(e.UNIFORM_BUFFER,N,L),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,T,b),b}function p(){for(let x=0;x<s;x++)if(o.indexOf(x)===-1)return o.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function _(x){const T=a[x.id],b=x.uniforms,N=x.__cache;e.bindBuffer(e.UNIFORM_BUFFER,T);for(let L=0,U=b.length;L<U;L++){const G=Array.isArray(b[L])?b[L]:[b[L]];for(let v=0,g=G.length;v<g;v++){const D=G[v];if(S(D,L,v,N)===!0){const j=D.__offset,H=Array.isArray(D.value)?D.value:[D.value];let q=0;for(let J=0;J<H.length;J++){const z=H[J],$=A(z);typeof z=="number"||typeof z=="boolean"?(D.__data[0]=z,e.bufferSubData(e.UNIFORM_BUFFER,j+q,D.__data)):z.isMatrix3?(D.__data[0]=z.elements[0],D.__data[1]=z.elements[1],D.__data[2]=z.elements[2],D.__data[3]=0,D.__data[4]=z.elements[3],D.__data[5]=z.elements[4],D.__data[6]=z.elements[5],D.__data[7]=0,D.__data[8]=z.elements[6],D.__data[9]=z.elements[7],D.__data[10]=z.elements[8],D.__data[11]=0):(z.toArray(D.__data,q),q+=$.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,j,D.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function S(x,T,b,N){const L=x.value,U=T+"_"+b;if(N[U]===void 0)return typeof L=="number"||typeof L=="boolean"?N[U]=L:N[U]=L.clone(),!0;{const G=N[U];if(typeof L=="number"||typeof L=="boolean"){if(G!==L)return N[U]=L,!0}else if(G.equals(L)===!1)return G.copy(L),!0}return!1}function C(x){const T=x.uniforms;let b=0;const N=16;for(let U=0,G=T.length;U<G;U++){const v=Array.isArray(T[U])?T[U]:[T[U]];for(let g=0,D=v.length;g<D;g++){const j=v[g],H=Array.isArray(j.value)?j.value:[j.value];for(let q=0,J=H.length;q<J;q++){const z=H[q],$=A(z),B=b%N,me=B%$.boundary,Ee=B+me;b+=me,Ee!==0&&N-Ee<$.storage&&(b+=N-Ee),j.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),j.__offset=b,b+=$.storage}}}const L=b%N;return L>0&&(b+=N-L),x.__size=b,x.__cache={},this}function A(x){const T={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(T.boundary=4,T.storage=4):x.isVector2?(T.boundary=8,T.storage=8):x.isVector3||x.isColor?(T.boundary=16,T.storage=12):x.isVector4?(T.boundary=16,T.storage=16):x.isMatrix3?(T.boundary=48,T.storage=48):x.isMatrix4?(T.boundary=64,T.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),T}function u(x){const T=x.target;T.removeEventListener("dispose",u);const b=o.indexOf(T.__bindingPointIndex);o.splice(b,1),e.deleteBuffer(a[T.id]),delete a[T.id],delete r[T.id]}function c(){for(const x in a)e.deleteBuffer(a[x]);o=[],a={},r={}}return{bind:l,update:f,dispose:c}}class Yu{constructor(n={}){const{canvas:t=xr(),context:i=null,depth:a=!0,stencil:r=!1,alpha:o=!1,antialias:s=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:f=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:p=!1,reverseDepthBuffer:_=!1}=n;this.isWebGLRenderer=!0;let S;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=i.getContextAttributes().alpha}else S=o;const C=new Uint32Array(4),A=new Int32Array(4);let u=null,c=null;const x=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ut,this.toneMapping=Nt,this.toneMappingExposure=1;const b=this;let N=!1,L=0,U=0,G=null,v=-1,g=null;const D=new dt,j=new dt;let H=null;const q=new ke(0);let J=0,z=t.width,$=t.height,B=1,me=null,Ee=null;const Pe=new dt(0,0,z,$),Ve=new dt(0,0,z,$);let Ze=!1;const V=new Fa;let Z=!1,ue=!1;this.transmissionResolutionScale=1;const ie=new Mt,ve=new Mt,He=new De,Te=new dt,tt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qe=!1;function Ue(){return G===null?B:1}let M=i;function ht(h,w){return t.getContext(h,w)}try{const h={alpha:!0,depth:a,stencil:r,antialias:s,premultipliedAlpha:l,preserveDrawingBuffer:f,powerPreference:m,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Mr}`),t.addEventListener("webglcontextlost",X,!1),t.addEventListener("webglcontextrestored",oe,!1),t.addEventListener("webglcontextcreationerror",re,!1),M===null){const w="webgl2";if(M=ht(w,h),M===null)throw ht(w)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(h){throw console.error("THREE.WebGLRenderer: "+h.message),h}let ye,Ie,_e,qe,he,E,d,y,W,K,k,pe,ae,ce,Oe,Q,le,Se,xe,fe,Ne,Ce,je,R;function te(){ye=new cf(M),ye.init(),Ce=new Wd(M,ye),Ie=new ef(M,ye,n,Ce),_e=new Vd(M,ye),Ie.reverseDepthBuffer&&_&&_e.buffers.depth.setReversed(!0),qe=new df(M),he=new Pd,E=new zd(M,ye,_e,he,Ie,Ce,qe),d=new nf(b),y=new sf(b),W=new _s(M),je=new Zl(M,W),K=new lf(M,W,qe,je),k=new pf(M,K,W,qe),xe=new uf(M,Ie,E),Q=new tf(he),pe=new wd(b,d,y,ye,Ie,je,Q),ae=new Qd(b,he),ce=new Dd,Oe=new Fd(ye),Se=new Jl(b,d,y,_e,k,S,l),le=new kd(b,k,Ie),R=new Jd(M,qe,Ie,_e),fe=new $l(M,ye,qe),Ne=new ff(M,ye,qe),qe.programs=pe.programs,b.capabilities=Ie,b.extensions=ye,b.properties=he,b.renderLists=ce,b.shadowMap=le,b.state=_e,b.info=qe}te();const F=new Kd(b,M);this.xr=F,this.getContext=function(){return M},this.getContextAttributes=function(){return M.getContextAttributes()},this.forceContextLoss=function(){const h=ye.get("WEBGL_lose_context");h&&h.loseContext()},this.forceContextRestore=function(){const h=ye.get("WEBGL_lose_context");h&&h.restoreContext()},this.getPixelRatio=function(){return B},this.setPixelRatio=function(h){h!==void 0&&(B=h,this.setSize(z,$,!1))},this.getSize=function(h){return h.set(z,$)},this.setSize=function(h,w,I=!0){if(F.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=h,$=w,t.width=Math.floor(h*B),t.height=Math.floor(w*B),I===!0&&(t.style.width=h+"px",t.style.height=w+"px"),this.setViewport(0,0,h,w)},this.getDrawingBufferSize=function(h){return h.set(z*B,$*B).floor()},this.setDrawingBufferSize=function(h,w,I){z=h,$=w,B=I,t.width=Math.floor(h*I),t.height=Math.floor(w*I),this.setViewport(0,0,h,w)},this.getCurrentViewport=function(h){return h.copy(D)},this.getViewport=function(h){return h.copy(Pe)},this.setViewport=function(h,w,I,O){h.isVector4?Pe.set(h.x,h.y,h.z,h.w):Pe.set(h,w,I,O),_e.viewport(D.copy(Pe).multiplyScalar(B).round())},this.getScissor=function(h){return h.copy(Ve)},this.setScissor=function(h,w,I,O){h.isVector4?Ve.set(h.x,h.y,h.z,h.w):Ve.set(h,w,I,O),_e.scissor(j.copy(Ve).multiplyScalar(B).round())},this.getScissorTest=function(){return Ze},this.setScissorTest=function(h){_e.setScissorTest(Ze=h)},this.setOpaqueSort=function(h){me=h},this.setTransparentSort=function(h){Ee=h},this.getClearColor=function(h){return h.copy(Se.getClearColor())},this.setClearColor=function(){Se.setClearColor(...arguments)},this.getClearAlpha=function(){return Se.getClearAlpha()},this.setClearAlpha=function(){Se.setClearAlpha(...arguments)},this.clear=function(h=!0,w=!0,I=!0){let O=0;if(h){let P=!1;if(G!==null){const Y=G.texture.format;P=Y===Qa||Y===Ya||Y===Ka}if(P){const Y=G.texture.type,ne=Y===Kt||Y===gn||Y===Un||Y===_n||Y===Wa||Y===Xa,se=Se.getClearColor(),de=Se.getClearAlpha(),Me=se.r,Ae=se.g,ge=se.b;ne?(C[0]=Me,C[1]=Ae,C[2]=ge,C[3]=de,M.clearBufferuiv(M.COLOR,0,C)):(A[0]=Me,A[1]=Ae,A[2]=ge,A[3]=de,M.clearBufferiv(M.COLOR,0,A))}else O|=M.COLOR_BUFFER_BIT}w&&(O|=M.DEPTH_BUFFER_BIT),I&&(O|=M.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),M.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",X,!1),t.removeEventListener("webglcontextrestored",oe,!1),t.removeEventListener("webglcontextcreationerror",re,!1),Se.dispose(),ce.dispose(),Oe.dispose(),he.dispose(),d.dispose(),y.dispose(),k.dispose(),je.dispose(),R.dispose(),pe.dispose(),F.dispose(),F.removeEventListener("sessionstart",vi),F.removeEventListener("sessionend",Ei),Ot.stop()};function X(h){h.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),N=!0}function oe(){console.log("THREE.WebGLRenderer: Context Restored."),N=!1;const h=qe.autoReset,w=le.enabled,I=le.autoUpdate,O=le.needsUpdate,P=le.type;te(),qe.autoReset=h,le.enabled=w,le.autoUpdate=I,le.needsUpdate=O,le.type=P}function re(h){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",h.statusMessage)}function Re(h){const w=h.target;w.removeEventListener("dispose",Re),$e(w)}function $e(h){ot(h),he.remove(h)}function ot(h){const w=he.get(h).programs;w!==void 0&&(w.forEach(function(I){pe.releaseProgram(I)}),h.isShaderMaterial&&pe.releaseShaderCache(h))}this.renderBufferDirect=function(h,w,I,O,P,Y){w===null&&(w=tt);const ne=P.isMesh&&P.matrixWorld.determinant()<0,se=gr(h,w,I,O,P);_e.setMaterial(O,ne);let de=I.index,Me=1;if(O.wireframe===!0){if(de=K.getWireframeAttribute(I),de===void 0)return;Me=2}const Ae=I.drawRange,ge=I.attributes.position;let Fe=Ae.start*Me,ze=(Ae.start+Ae.count)*Me;Y!==null&&(Fe=Math.max(Fe,Y.start*Me),ze=Math.min(ze,(Y.start+Y.count)*Me)),de!==null?(Fe=Math.max(Fe,0),ze=Math.min(ze,de.count)):ge!=null&&(Fe=Math.max(Fe,0),ze=Math.min(ze,ge.count));const nt=ze-Fe;if(nt<0||nt===1/0)return;je.setup(P,O,se,I,de);let et,Ge=fe;if(de!==null&&(et=W.get(de),Ge=Ne,Ge.setIndex(et)),P.isMesh)O.wireframe===!0?(_e.setLineWidth(O.wireframeLinewidth*Ue()),Ge.setMode(M.LINES)):Ge.setMode(M.TRIANGLES);else if(P.isLine){let be=O.linewidth;be===void 0&&(be=1),_e.setLineWidth(be*Ue()),P.isLineSegments?Ge.setMode(M.LINES):P.isLineLoop?Ge.setMode(M.LINE_LOOP):Ge.setMode(M.LINE_STRIP)}else P.isPoints?Ge.setMode(M.POINTS):P.isSprite&&Ge.setMode(M.TRIANGLES);if(P.isBatchedMesh)if(P._multiDrawInstances!==null)Ht("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Ge.renderMultiDrawInstances(P._multiDrawStarts,P._multiDrawCounts,P._multiDrawCount,P._multiDrawInstances);else if(ye.get("WEBGL_multi_draw"))Ge.renderMultiDraw(P._multiDrawStarts,P._multiDrawCounts,P._multiDrawCount);else{const be=P._multiDrawStarts,rt=P._multiDrawCounts,We=P._multiDrawCount,Et=de?W.get(de).bytesPerElement:1,Qt=he.get(O).currentProgram.getUniforms();for(let pt=0;pt<We;pt++)Qt.setValue(M,"_gl_DrawID",pt),Ge.render(be[pt]/Et,rt[pt])}else if(P.isInstancedMesh)Ge.renderInstances(Fe,nt,P.count);else if(I.isInstancedBufferGeometry){const be=I._maxInstanceCount!==void 0?I._maxInstanceCount:1/0,rt=Math.min(I.instanceCount,be);Ge.renderInstances(Fe,nt,rt)}else Ge.render(Fe,nt)};function Xe(h,w,I){h.transparent===!0&&h.side===xt&&h.forceSinglePass===!1?(h.side=bt,h.needsUpdate=!0,En(h,w,I),h.side=an,h.needsUpdate=!0,En(h,w,I),h.side=xt):En(h,w,I)}this.compile=function(h,w,I=null){I===null&&(I=h),c=Oe.get(I),c.init(w),T.push(c),I.traverseVisible(function(P){P.isLight&&P.layers.test(w.layers)&&(c.pushLight(P),P.castShadow&&c.pushShadow(P))}),h!==I&&h.traverseVisible(function(P){P.isLight&&P.layers.test(w.layers)&&(c.pushLight(P),P.castShadow&&c.pushShadow(P))}),c.setupLights();const O=new Set;return h.traverse(function(P){if(!(P.isMesh||P.isPoints||P.isLine||P.isSprite))return;const Y=P.material;if(Y)if(Array.isArray(Y))for(let ne=0;ne<Y.length;ne++){const se=Y[ne];Xe(se,I,P),O.add(se)}else Xe(Y,I,P),O.add(Y)}),c=T.pop(),O},this.compileAsync=function(h,w,I=null){const O=this.compile(h,w,I);return new Promise(P=>{function Y(){if(O.forEach(function(ne){he.get(ne).currentProgram.isReady()&&O.delete(ne)}),O.size===0){P(h);return}setTimeout(Y,10)}ye.get("KHR_parallel_shader_compile")!==null?Y():setTimeout(Y,10)})};let vt=null;function Rt(h){vt&&vt(h)}function vi(){Ot.stop()}function Ei(){Ot.start()}const Ot=new lr;Ot.setAnimationLoop(Rt),typeof self<"u"&&Ot.setContext(self),this.setAnimationLoop=function(h){vt=h,F.setAnimationLoop(h),h===null?Ot.stop():Ot.start()},F.addEventListener("sessionstart",vi),F.addEventListener("sessionend",Ei),this.render=function(h,w){if(w!==void 0&&w.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;if(h.matrixWorldAutoUpdate===!0&&h.updateMatrixWorld(),w.parent===null&&w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),F.enabled===!0&&F.isPresenting===!0&&(F.cameraAutoUpdate===!0&&F.updateCamera(w),w=F.getCamera()),h.isScene===!0&&h.onBeforeRender(b,h,w,G),c=Oe.get(h,T.length),c.init(w),T.push(c),ve.multiplyMatrices(w.projectionMatrix,w.matrixWorldInverse),V.setFromProjectionMatrix(ve),ue=this.localClippingEnabled,Z=Q.init(this.clippingPlanes,ue),u=ce.get(h,x.length),u.init(),x.push(u),F.enabled===!0&&F.isPresenting===!0){const Y=b.xr.getDepthSensingMesh();Y!==null&&Gn(Y,w,-1/0,b.sortObjects)}Gn(h,w,0,b.sortObjects),u.finish(),b.sortObjects===!0&&u.sort(me,Ee),Qe=F.enabled===!1||F.isPresenting===!1||F.hasDepthSensing()===!1,Qe&&Se.addToRenderList(u,h),this.info.render.frame++,Z===!0&&Q.beginShadows();const I=c.state.shadowsArray;le.render(I,h,w),Z===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();const O=u.opaque,P=u.transmissive;if(c.setupLights(),w.isArrayCamera){const Y=w.cameras;if(P.length>0)for(let ne=0,se=Y.length;ne<se;ne++){const de=Y[ne];Ti(O,P,h,de)}Qe&&Se.render(h);for(let ne=0,se=Y.length;ne<se;ne++){const de=Y[ne];Si(u,h,de,de.viewport)}}else P.length>0&&Ti(O,P,h,w),Qe&&Se.render(h),Si(u,h,w);G!==null&&U===0&&(E.updateMultisampleRenderTarget(G),E.updateRenderTargetMipmap(G)),h.isScene===!0&&h.onAfterRender(b,h,w),je.resetDefaultState(),v=-1,g=null,T.pop(),T.length>0?(c=T[T.length-1],Z===!0&&Q.setGlobalState(b.clippingPlanes,c.state.camera)):c=null,x.pop(),x.length>0?u=x[x.length-1]:u=null};function Gn(h,w,I,O){if(h.visible===!1)return;if(h.layers.test(w.layers)){if(h.isGroup)I=h.renderOrder;else if(h.isLOD)h.autoUpdate===!0&&h.update(w);else if(h.isLight)c.pushLight(h),h.castShadow&&c.pushShadow(h);else if(h.isSprite){if(!h.frustumCulled||V.intersectsSprite(h)){O&&Te.setFromMatrixPosition(h.matrixWorld).applyMatrix4(ve);const ne=k.update(h),se=h.material;se.visible&&u.push(h,ne,se,I,Te.z,null)}}else if((h.isMesh||h.isLine||h.isPoints)&&(!h.frustumCulled||V.intersectsObject(h))){const ne=k.update(h),se=h.material;if(O&&(h.boundingSphere!==void 0?(h.boundingSphere===null&&h.computeBoundingSphere(),Te.copy(h.boundingSphere.center)):(ne.boundingSphere===null&&ne.computeBoundingSphere(),Te.copy(ne.boundingSphere.center)),Te.applyMatrix4(h.matrixWorld).applyMatrix4(ve)),Array.isArray(se)){const de=ne.groups;for(let Me=0,Ae=de.length;Me<Ae;Me++){const ge=de[Me],Fe=se[ge.materialIndex];Fe&&Fe.visible&&u.push(h,ne,Fe,I,Te.z,ge)}}else se.visible&&u.push(h,ne,se,I,Te.z,null)}}const Y=h.children;for(let ne=0,se=Y.length;ne<se;ne++)Gn(Y[ne],w,I,O)}function Si(h,w,I,O){const P=h.opaque,Y=h.transmissive,ne=h.transparent;c.setupLightsView(I),Z===!0&&Q.setGlobalState(b.clippingPlanes,I),O&&_e.viewport(D.copy(O)),P.length>0&&vn(P,w,I),Y.length>0&&vn(Y,w,I),ne.length>0&&vn(ne,w,I),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function Ti(h,w,I,O){if((I.isScene===!0?I.overrideMaterial:null)!==null)return;c.state.transmissionRenderTarget[O.id]===void 0&&(c.state.transmissionRenderTarget[O.id]=new nn(1,1,{generateMipmaps:!0,type:ye.has("EXT_color_buffer_half_float")||ye.has("EXT_color_buffer_float")?In:Kt,minFilter:Wt,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Je.workingColorSpace}));const Y=c.state.transmissionRenderTarget[O.id],ne=O.viewport||D;Y.setSize(ne.z*b.transmissionResolutionScale,ne.w*b.transmissionResolutionScale);const se=b.getRenderTarget();b.setRenderTarget(Y),b.getClearColor(q),J=b.getClearAlpha(),J<1&&b.setClearColor(16777215,.5),b.clear(),Qe&&Se.render(I);const de=b.toneMapping;b.toneMapping=Nt;const Me=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),c.setupLightsView(O),Z===!0&&Q.setGlobalState(b.clippingPlanes,O),vn(h,I,O),E.updateMultisampleRenderTarget(Y),E.updateRenderTargetMipmap(Y),ye.has("WEBGL_multisampled_render_to_texture")===!1){let Ae=!1;for(let ge=0,Fe=w.length;ge<Fe;ge++){const ze=w[ge],nt=ze.object,et=ze.geometry,Ge=ze.material,be=ze.group;if(Ge.side===xt&&nt.layers.test(O.layers)){const rt=Ge.side;Ge.side=bt,Ge.needsUpdate=!0,xi(nt,I,O,et,Ge,be),Ge.side=rt,Ge.needsUpdate=!0,Ae=!0}}Ae===!0&&(E.updateMultisampleRenderTarget(Y),E.updateRenderTargetMipmap(Y))}b.setRenderTarget(se),b.setClearColor(q,J),Me!==void 0&&(O.viewport=Me),b.toneMapping=de}function vn(h,w,I){const O=w.isScene===!0?w.overrideMaterial:null;for(let P=0,Y=h.length;P<Y;P++){const ne=h[P],se=ne.object,de=ne.geometry,Me=O===null?ne.material:O,Ae=ne.group;se.layers.test(I.layers)&&xi(se,w,I,de,Me,Ae)}}function xi(h,w,I,O,P,Y){h.onBeforeRender(b,w,I,O,P,Y),h.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,h.matrixWorld),h.normalMatrix.getNormalMatrix(h.modelViewMatrix),P.onBeforeRender(b,w,I,O,h,Y),P.transparent===!0&&P.side===xt&&P.forceSinglePass===!1?(P.side=bt,P.needsUpdate=!0,b.renderBufferDirect(I,w,O,P,h,Y),P.side=an,P.needsUpdate=!0,b.renderBufferDirect(I,w,O,P,h,Y),P.side=xt):b.renderBufferDirect(I,w,O,P,h,Y),h.onAfterRender(b,w,I,O,P,Y)}function En(h,w,I){w.isScene!==!0&&(w=tt);const O=he.get(h),P=c.state.lights,Y=c.state.shadowsArray,ne=P.state.version,se=pe.getParameters(h,P.state,Y,w,I),de=pe.getProgramCacheKey(se);let Me=O.programs;O.environment=h.isMeshStandardMaterial?w.environment:null,O.fog=w.fog,O.envMap=(h.isMeshStandardMaterial?y:d).get(h.envMap||O.environment),O.envMapRotation=O.environment!==null&&h.envMap===null?w.environmentRotation:h.envMapRotation,Me===void 0&&(h.addEventListener("dispose",Re),Me=new Map,O.programs=Me);let Ae=Me.get(de);if(Ae!==void 0){if(O.currentProgram===Ae&&O.lightsStateVersion===ne)return Ai(h,se),Ae}else se.uniforms=pe.getUniforms(h),h.onBeforeCompile(se,b),Ae=pe.acquireProgram(se,de),Me.set(de,Ae),O.uniforms=se.uniforms;const ge=O.uniforms;return(!h.isShaderMaterial&&!h.isRawShaderMaterial||h.clipping===!0)&&(ge.clippingPlanes=Q.uniform),Ai(h,se),O.needsLights=vr(h),O.lightsStateVersion=ne,O.needsLights&&(ge.ambientLightColor.value=P.state.ambient,ge.lightProbe.value=P.state.probe,ge.directionalLights.value=P.state.directional,ge.directionalLightShadows.value=P.state.directionalShadow,ge.spotLights.value=P.state.spot,ge.spotLightShadows.value=P.state.spotShadow,ge.rectAreaLights.value=P.state.rectArea,ge.ltc_1.value=P.state.rectAreaLTC1,ge.ltc_2.value=P.state.rectAreaLTC2,ge.pointLights.value=P.state.point,ge.pointLightShadows.value=P.state.pointShadow,ge.hemisphereLights.value=P.state.hemi,ge.directionalShadowMap.value=P.state.directionalShadowMap,ge.directionalShadowMatrix.value=P.state.directionalShadowMatrix,ge.spotShadowMap.value=P.state.spotShadowMap,ge.spotLightMatrix.value=P.state.spotLightMatrix,ge.spotLightMap.value=P.state.spotLightMap,ge.pointShadowMap.value=P.state.pointShadowMap,ge.pointShadowMatrix.value=P.state.pointShadowMatrix),O.currentProgram=Ae,O.uniformsList=null,Ae}function Mi(h){if(h.uniformsList===null){const w=h.currentProgram.getUniforms();h.uniformsList=wn.seqWithValue(w.seq,h.uniforms)}return h.uniformsList}function Ai(h,w){const I=he.get(h);I.outputColorSpace=w.outputColorSpace,I.batching=w.batching,I.batchingColor=w.batchingColor,I.instancing=w.instancing,I.instancingColor=w.instancingColor,I.instancingMorph=w.instancingMorph,I.skinning=w.skinning,I.morphTargets=w.morphTargets,I.morphNormals=w.morphNormals,I.morphColors=w.morphColors,I.morphTargetsCount=w.morphTargetsCount,I.numClippingPlanes=w.numClippingPlanes,I.numIntersection=w.numClipIntersection,I.vertexAlphas=w.vertexAlphas,I.vertexTangents=w.vertexTangents,I.toneMapping=w.toneMapping}function gr(h,w,I,O,P){w.isScene!==!0&&(w=tt),E.resetTextureUnits();const Y=w.fog,ne=O.isMeshStandardMaterial?w.environment:null,se=G===null?b.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:ut,de=(O.isMeshStandardMaterial?y:d).get(O.envMap||ne),Me=O.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,Ae=!!I.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),ge=!!I.morphAttributes.position,Fe=!!I.morphAttributes.normal,ze=!!I.morphAttributes.color;let nt=Nt;O.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(nt=b.toneMapping);const et=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,Ge=et!==void 0?et.length:0,be=he.get(O),rt=c.state.lights;if(Z===!0&&(ue===!0||h!==g)){const ct=h===g&&O.id===v;Q.setState(O,h,ct)}let We=!1;O.version===be.__version?(be.needsLights&&be.lightsStateVersion!==rt.state.version||be.outputColorSpace!==se||P.isBatchedMesh&&be.batching===!1||!P.isBatchedMesh&&be.batching===!0||P.isBatchedMesh&&be.batchingColor===!0&&P.colorTexture===null||P.isBatchedMesh&&be.batchingColor===!1&&P.colorTexture!==null||P.isInstancedMesh&&be.instancing===!1||!P.isInstancedMesh&&be.instancing===!0||P.isSkinnedMesh&&be.skinning===!1||!P.isSkinnedMesh&&be.skinning===!0||P.isInstancedMesh&&be.instancingColor===!0&&P.instanceColor===null||P.isInstancedMesh&&be.instancingColor===!1&&P.instanceColor!==null||P.isInstancedMesh&&be.instancingMorph===!0&&P.morphTexture===null||P.isInstancedMesh&&be.instancingMorph===!1&&P.morphTexture!==null||be.envMap!==de||O.fog===!0&&be.fog!==Y||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==Q.numPlanes||be.numIntersection!==Q.numIntersection)||be.vertexAlphas!==Me||be.vertexTangents!==Ae||be.morphTargets!==ge||be.morphNormals!==Fe||be.morphColors!==ze||be.toneMapping!==nt||be.morphTargetsCount!==Ge)&&(We=!0):(We=!0,be.__version=O.version);let Et=be.currentProgram;We===!0&&(Et=En(O,w,P));let Qt=!1,pt=!1,cn=!1;const Ye=Et.getUniforms(),mt=be.uniforms;if(_e.useProgram(Et.program)&&(Qt=!0,pt=!0,cn=!0),O.id!==v&&(v=O.id,pt=!0),Qt||g!==h){_e.buffers.depth.getReversed()?(ie.copy(h.projectionMatrix),Ar(ie),Rr(ie),Ye.setValue(M,"projectionMatrix",ie)):Ye.setValue(M,"projectionMatrix",h.projectionMatrix),Ye.setValue(M,"viewMatrix",h.matrixWorldInverse);const lt=Ye.map.cameraPosition;lt!==void 0&&lt.setValue(M,He.setFromMatrixPosition(h.matrixWorld)),Ie.logarithmicDepthBuffer&&Ye.setValue(M,"logDepthBufFC",2/(Math.log(h.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&Ye.setValue(M,"isOrthographic",h.isOrthographicCamera===!0),g!==h&&(g=h,pt=!0,cn=!0)}if(P.isSkinnedMesh){Ye.setOptional(M,P,"bindMatrix"),Ye.setOptional(M,P,"bindMatrixInverse");const ct=P.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),Ye.setValue(M,"boneTexture",ct.boneTexture,E))}P.isBatchedMesh&&(Ye.setOptional(M,P,"batchingTexture"),Ye.setValue(M,"batchingTexture",P._matricesTexture,E),Ye.setOptional(M,P,"batchingIdTexture"),Ye.setValue(M,"batchingIdTexture",P._indirectTexture,E),Ye.setOptional(M,P,"batchingColorTexture"),P._colorsTexture!==null&&Ye.setValue(M,"batchingColorTexture",P._colorsTexture,E));const _t=I.morphAttributes;if((_t.position!==void 0||_t.normal!==void 0||_t.color!==void 0)&&xe.update(P,I,Et),(pt||be.receiveShadow!==P.receiveShadow)&&(be.receiveShadow=P.receiveShadow,Ye.setValue(M,"receiveShadow",P.receiveShadow)),O.isMeshGouraudMaterial&&O.envMap!==null&&(mt.envMap.value=de,mt.flipEnvMap.value=de.isCubeTexture&&de.isRenderTargetTexture===!1?-1:1),O.isMeshStandardMaterial&&O.envMap===null&&w.environment!==null&&(mt.envMapIntensity.value=w.environmentIntensity),pt&&(Ye.setValue(M,"toneMappingExposure",b.toneMappingExposure),be.needsLights&&br(mt,cn),Y&&O.fog===!0&&ae.refreshFogUniforms(mt,Y),ae.refreshMaterialUniforms(mt,O,B,$,c.state.transmissionRenderTarget[h.id]),wn.upload(M,Mi(be),mt,E)),O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(wn.upload(M,Mi(be),mt,E),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&Ye.setValue(M,"center",P.center),Ye.setValue(M,"modelViewMatrix",P.modelViewMatrix),Ye.setValue(M,"normalMatrix",P.normalMatrix),Ye.setValue(M,"modelMatrix",P.matrixWorld),O.isShaderMaterial||O.isRawShaderMaterial){const ct=O.uniformsGroups;for(let lt=0,Bn=ct.length;lt<Bn;lt++){const Ft=ct[lt];R.update(Ft,Et),R.bind(Ft,Et)}}return Et}function br(h,w){h.ambientLightColor.needsUpdate=w,h.lightProbe.needsUpdate=w,h.directionalLights.needsUpdate=w,h.directionalLightShadows.needsUpdate=w,h.pointLights.needsUpdate=w,h.pointLightShadows.needsUpdate=w,h.spotLights.needsUpdate=w,h.spotLightShadows.needsUpdate=w,h.rectAreaLights.needsUpdate=w,h.hemisphereLights.needsUpdate=w}function vr(h){return h.isMeshLambertMaterial||h.isMeshToonMaterial||h.isMeshPhongMaterial||h.isMeshStandardMaterial||h.isShadowMaterial||h.isShaderMaterial&&h.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return U},this.getRenderTarget=function(){return G},this.setRenderTargetTextures=function(h,w,I){he.get(h.texture).__webglTexture=w,he.get(h.depthTexture).__webglTexture=I;const O=he.get(h);O.__hasExternalTextures=!0,O.__autoAllocateDepthBuffer=I===void 0,O.__autoAllocateDepthBuffer||ye.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),O.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(h,w){const I=he.get(h);I.__webglFramebuffer=w,I.__useDefaultFramebuffer=w===void 0};const Er=M.createFramebuffer();this.setRenderTarget=function(h,w=0,I=0){G=h,L=w,U=I;let O=!0,P=null,Y=!1,ne=!1;if(h){const de=he.get(h);if(de.__useDefaultFramebuffer!==void 0)_e.bindFramebuffer(M.FRAMEBUFFER,null),O=!1;else if(de.__webglFramebuffer===void 0)E.setupRenderTarget(h);else if(de.__hasExternalTextures)E.rebindTextures(h,he.get(h.texture).__webglTexture,he.get(h.depthTexture).__webglTexture);else if(h.depthBuffer){const ge=h.depthTexture;if(de.__boundDepthTexture!==ge){if(ge!==null&&he.has(ge)&&(h.width!==ge.image.width||h.height!==ge.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");E.setupDepthRenderbuffer(h)}}const Me=h.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(ne=!0);const Ae=he.get(h).__webglFramebuffer;h.isWebGLCubeRenderTarget?(Array.isArray(Ae[w])?P=Ae[w][I]:P=Ae[w],Y=!0):h.samples>0&&E.useMultisampledRTT(h)===!1?P=he.get(h).__webglMultisampledFramebuffer:Array.isArray(Ae)?P=Ae[I]:P=Ae,D.copy(h.viewport),j.copy(h.scissor),H=h.scissorTest}else D.copy(Pe).multiplyScalar(B).floor(),j.copy(Ve).multiplyScalar(B).floor(),H=Ze;if(I!==0&&(P=Er),_e.bindFramebuffer(M.FRAMEBUFFER,P)&&O&&_e.drawBuffers(h,P),_e.viewport(D),_e.scissor(j),_e.setScissorTest(H),Y){const de=he.get(h.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_CUBE_MAP_POSITIVE_X+w,de.__webglTexture,I)}else if(ne){const de=he.get(h.texture),Me=w;M.framebufferTextureLayer(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,de.__webglTexture,I,Me)}else if(h!==null&&I!==0){const de=he.get(h.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,de.__webglTexture,I)}v=-1},this.readRenderTargetPixels=function(h,w,I,O,P,Y,ne){if(!(h&&h.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let se=he.get(h).__webglFramebuffer;if(h.isWebGLCubeRenderTarget&&ne!==void 0&&(se=se[ne]),se){_e.bindFramebuffer(M.FRAMEBUFFER,se);try{const de=h.texture,Me=de.format,Ae=de.type;if(!Ie.textureFormatReadable(Me)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ie.textureTypeReadable(Ae)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}w>=0&&w<=h.width-O&&I>=0&&I<=h.height-P&&M.readPixels(w,I,O,P,Ce.convert(Me),Ce.convert(Ae),Y)}finally{const de=G!==null?he.get(G).__webglFramebuffer:null;_e.bindFramebuffer(M.FRAMEBUFFER,de)}}},this.readRenderTargetPixelsAsync=async function(h,w,I,O,P,Y,ne){if(!(h&&h.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let se=he.get(h).__webglFramebuffer;if(h.isWebGLCubeRenderTarget&&ne!==void 0&&(se=se[ne]),se){const de=h.texture,Me=de.format,Ae=de.type;if(!Ie.textureFormatReadable(Me))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ie.textureTypeReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(w>=0&&w<=h.width-O&&I>=0&&I<=h.height-P){_e.bindFramebuffer(M.FRAMEBUFFER,se);const ge=M.createBuffer();M.bindBuffer(M.PIXEL_PACK_BUFFER,ge),M.bufferData(M.PIXEL_PACK_BUFFER,Y.byteLength,M.STREAM_READ),M.readPixels(w,I,O,P,Ce.convert(Me),Ce.convert(Ae),0);const Fe=G!==null?he.get(G).__webglFramebuffer:null;_e.bindFramebuffer(M.FRAMEBUFFER,Fe);const ze=M.fenceSync(M.SYNC_GPU_COMMANDS_COMPLETE,0);return M.flush(),await Cr(M,ze,4),M.bindBuffer(M.PIXEL_PACK_BUFFER,ge),M.getBufferSubData(M.PIXEL_PACK_BUFFER,0,Y),M.deleteBuffer(ge),M.deleteSync(ze),Y}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(h,w=null,I=0){h.isTexture!==!0&&(Ht("WebGLRenderer: copyFramebufferToTexture function signature has changed."),w=arguments[0]||null,h=arguments[1]);const O=Math.pow(2,-I),P=Math.floor(h.image.width*O),Y=Math.floor(h.image.height*O),ne=w!==null?w.x:0,se=w!==null?w.y:0;E.setTexture2D(h,0),M.copyTexSubImage2D(M.TEXTURE_2D,I,0,0,ne,se,P,Y),_e.unbindTexture()};const Sr=M.createFramebuffer(),Tr=M.createFramebuffer();this.copyTextureToTexture=function(h,w,I=null,O=null,P=0,Y=null){h.isTexture!==!0&&(Ht("WebGLRenderer: copyTextureToTexture function signature has changed."),O=arguments[0]||null,h=arguments[1],w=arguments[2],Y=arguments[3]||0,I=null),Y===null&&(P!==0?(Ht("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Y=P,P=0):Y=0);let ne,se,de,Me,Ae,ge,Fe,ze,nt;const et=h.isCompressedTexture?h.mipmaps[Y]:h.image;if(I!==null)ne=I.max.x-I.min.x,se=I.max.y-I.min.y,de=I.isBox3?I.max.z-I.min.z:1,Me=I.min.x,Ae=I.min.y,ge=I.isBox3?I.min.z:0;else{const _t=Math.pow(2,-P);ne=Math.floor(et.width*_t),se=Math.floor(et.height*_t),h.isDataArrayTexture?de=et.depth:h.isData3DTexture?de=Math.floor(et.depth*_t):de=1,Me=0,Ae=0,ge=0}O!==null?(Fe=O.x,ze=O.y,nt=O.z):(Fe=0,ze=0,nt=0);const Ge=Ce.convert(w.format),be=Ce.convert(w.type);let rt;w.isData3DTexture?(E.setTexture3D(w,0),rt=M.TEXTURE_3D):w.isDataArrayTexture||w.isCompressedArrayTexture?(E.setTexture2DArray(w,0),rt=M.TEXTURE_2D_ARRAY):(E.setTexture2D(w,0),rt=M.TEXTURE_2D),M.pixelStorei(M.UNPACK_FLIP_Y_WEBGL,w.flipY),M.pixelStorei(M.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),M.pixelStorei(M.UNPACK_ALIGNMENT,w.unpackAlignment);const We=M.getParameter(M.UNPACK_ROW_LENGTH),Et=M.getParameter(M.UNPACK_IMAGE_HEIGHT),Qt=M.getParameter(M.UNPACK_SKIP_PIXELS),pt=M.getParameter(M.UNPACK_SKIP_ROWS),cn=M.getParameter(M.UNPACK_SKIP_IMAGES);M.pixelStorei(M.UNPACK_ROW_LENGTH,et.width),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,et.height),M.pixelStorei(M.UNPACK_SKIP_PIXELS,Me),M.pixelStorei(M.UNPACK_SKIP_ROWS,Ae),M.pixelStorei(M.UNPACK_SKIP_IMAGES,ge);const Ye=h.isDataArrayTexture||h.isData3DTexture,mt=w.isDataArrayTexture||w.isData3DTexture;if(h.isDepthTexture){const _t=he.get(h),ct=he.get(w),lt=he.get(_t.__renderTarget),Bn=he.get(ct.__renderTarget);_e.bindFramebuffer(M.READ_FRAMEBUFFER,lt.__webglFramebuffer),_e.bindFramebuffer(M.DRAW_FRAMEBUFFER,Bn.__webglFramebuffer);for(let Ft=0;Ft<de;Ft++)Ye&&(M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,he.get(h).__webglTexture,P,ge+Ft),M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,he.get(w).__webglTexture,Y,nt+Ft)),M.blitFramebuffer(Me,Ae,ne,se,Fe,ze,ne,se,M.DEPTH_BUFFER_BIT,M.NEAREST);_e.bindFramebuffer(M.READ_FRAMEBUFFER,null),_e.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else if(P!==0||h.isRenderTargetTexture||he.has(h)){const _t=he.get(h),ct=he.get(w);_e.bindFramebuffer(M.READ_FRAMEBUFFER,Sr),_e.bindFramebuffer(M.DRAW_FRAMEBUFFER,Tr);for(let lt=0;lt<de;lt++)Ye?M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,_t.__webglTexture,P,ge+lt):M.framebufferTexture2D(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,_t.__webglTexture,P),mt?M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,ct.__webglTexture,Y,nt+lt):M.framebufferTexture2D(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,ct.__webglTexture,Y),P!==0?M.blitFramebuffer(Me,Ae,ne,se,Fe,ze,ne,se,M.COLOR_BUFFER_BIT,M.NEAREST):mt?M.copyTexSubImage3D(rt,Y,Fe,ze,nt+lt,Me,Ae,ne,se):M.copyTexSubImage2D(rt,Y,Fe,ze,Me,Ae,ne,se);_e.bindFramebuffer(M.READ_FRAMEBUFFER,null),_e.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else mt?h.isDataTexture||h.isData3DTexture?M.texSubImage3D(rt,Y,Fe,ze,nt,ne,se,de,Ge,be,et.data):w.isCompressedArrayTexture?M.compressedTexSubImage3D(rt,Y,Fe,ze,nt,ne,se,de,Ge,et.data):M.texSubImage3D(rt,Y,Fe,ze,nt,ne,se,de,Ge,be,et):h.isDataTexture?M.texSubImage2D(M.TEXTURE_2D,Y,Fe,ze,ne,se,Ge,be,et.data):h.isCompressedTexture?M.compressedTexSubImage2D(M.TEXTURE_2D,Y,Fe,ze,et.width,et.height,Ge,et.data):M.texSubImage2D(M.TEXTURE_2D,Y,Fe,ze,ne,se,Ge,be,et);M.pixelStorei(M.UNPACK_ROW_LENGTH,We),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,Et),M.pixelStorei(M.UNPACK_SKIP_PIXELS,Qt),M.pixelStorei(M.UNPACK_SKIP_ROWS,pt),M.pixelStorei(M.UNPACK_SKIP_IMAGES,cn),Y===0&&w.generateMipmaps&&M.generateMipmap(rt),_e.unbindTexture()},this.copyTextureToTexture3D=function(h,w,I=null,O=null,P=0){return h.isTexture!==!0&&(Ht("WebGLRenderer: copyTextureToTexture3D function signature has changed."),I=arguments[0]||null,O=arguments[1]||null,h=arguments[2],w=arguments[3],P=arguments[4]||0),Ht('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(h,w,I,O,P)},this.initRenderTarget=function(h){he.get(h).__webglFramebuffer===void 0&&E.setupRenderTarget(h)},this.initTexture=function(h){h.isCubeTexture?E.setTextureCube(h,0):h.isData3DTexture?E.setTexture3D(h,0):h.isDataArrayTexture||h.isCompressedArrayTexture?E.setTexture2DArray(h,0):E.setTexture2D(h,0),_e.unbindTexture()},this.resetState=function(){L=0,U=0,G=null,_e.reset(),je.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return wr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;const t=this.getContext();t.drawingBufferColorspace=Je._getDrawingBufferColorSpace(n),t.unpackColorSpace=Je._getUnpackColorSpace()}}function Ua(e,n){if(n===Wo)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(n===ui||n===ir){let t=e.getIndex();if(t===null){const o=[],s=e.getAttribute("position");if(s!==void 0){for(let l=0;l<s.count;l++)o.push(l);e.setIndex(o),t=e.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e}const i=t.count-2,a=[];if(n===ui)for(let o=1;o<=i;o++)a.push(t.getX(0)),a.push(t.getX(o)),a.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(a.push(t.getX(o)),a.push(t.getX(o+1)),a.push(t.getX(o+2))):(a.push(t.getX(o+2)),a.push(t.getX(o+1)),a.push(t.getX(o)));a.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=e.clone();return r.setIndex(a),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",n),e}class Zd extends ar{constructor(n){super(n),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new iu(t)}),this.register(function(t){return new au(t)}),this.register(function(t){return new pu(t)}),this.register(function(t){return new hu(t)}),this.register(function(t){return new mu(t)}),this.register(function(t){return new ou(t)}),this.register(function(t){return new su(t)}),this.register(function(t){return new cu(t)}),this.register(function(t){return new lu(t)}),this.register(function(t){return new nu(t)}),this.register(function(t){return new fu(t)}),this.register(function(t){return new ru(t)}),this.register(function(t){return new uu(t)}),this.register(function(t){return new du(t)}),this.register(function(t){return new eu(t)}),this.register(function(t){return new _u(t)}),this.register(function(t){return new gu(t)})}load(n,t,i,a){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const f=mn.extractUrlBase(n);o=mn.resolveURL(f,this.path)}else o=mn.extractUrlBase(n);this.manager.itemStart(n);const s=function(f){a?a(f):console.error(f),r.manager.itemError(n),r.manager.itemEnd(n)},l=new yn(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(n,function(f){try{r.parse(f,o,function(m){t(m),r.manager.itemEnd(n)},s)}catch(m){s(m)}},i,s)}setDRACOLoader(n){return this.dracoLoader=n,this}setKTX2Loader(n){return this.ktx2Loader=n,this}setMeshoptDecoder(n){return this.meshoptDecoder=n,this}register(n){return this.pluginCallbacks.indexOf(n)===-1&&this.pluginCallbacks.push(n),this}unregister(n){return this.pluginCallbacks.indexOf(n)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(n),1),this}parse(n,t,i,a){let r;const o={},s={},l=new TextDecoder;if(typeof n=="string")r=JSON.parse(n);else if(n instanceof ArrayBuffer)if(l.decode(new Uint8Array(n,0,4))===hr){try{o[Le.KHR_BINARY_GLTF]=new bu(n)}catch(p){a&&a(p);return}r=JSON.parse(o[Le.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(n));else r=n;if(r.asset===void 0||r.asset.version[0]<2){a&&a(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const f=new Du(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});f.fileLoader.setRequestHeader(this.requestHeader);for(let m=0;m<this.pluginCallbacks.length;m++){const p=this.pluginCallbacks[m](f);p.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),s[p.name]=p,o[p.name]=!0}if(r.extensionsUsed)for(let m=0;m<r.extensionsUsed.length;++m){const p=r.extensionsUsed[m],_=r.extensionsRequired||[];switch(p){case Le.KHR_MATERIALS_UNLIT:o[p]=new tu;break;case Le.KHR_DRACO_MESH_COMPRESSION:o[p]=new vu(r,this.dracoLoader);break;case Le.KHR_TEXTURE_TRANSFORM:o[p]=new Eu;break;case Le.KHR_MESH_QUANTIZATION:o[p]=new Su;break;default:_.indexOf(p)>=0&&s[p]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+p+'".')}}f.setExtensions(o),f.setPlugins(s),f.parse(i,a)}parseAsync(n,t){const i=this;return new Promise(function(a,r){i.parse(n,t,a,r)})}}function $d(){let e={};return{get:function(n){return e[n]},add:function(n,t){e[n]=t},remove:function(n){delete e[n]},removeAll:function(){e={}}}}const Le={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class eu{constructor(n){this.parser=n,this.name=Le.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const n=this.parser,t=this.parser.json.nodes||[];for(let i=0,a=t.length;i<a;i++){const r=t[i];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&n._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(n){const t=this.parser,i="light:"+n;let a=t.cache.get(i);if(a)return a;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[n];let f;const m=new ke(16777215);l.color!==void 0&&m.setRGB(l.color[0],l.color[1],l.color[2],ut);const p=l.range!==void 0?l.range:0;switch(l.type){case"directional":f=new qo(m),f.target.position.set(0,0,-1),f.add(f.target);break;case"point":f=new jo(m),f.distance=p;break;case"spot":f=new Xo(m),f.distance=p,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,f.angle=l.spot.outerConeAngle,f.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,f.target.position.set(0,0,-1),f.add(f.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return f.position.set(0,0,0),wt(f,l),l.intensity!==void 0&&(f.intensity=l.intensity),f.name=t.createUniqueName(l.name||"light_"+n),a=Promise.resolve(f),t.cache.add(i,a),a}getDependency(n,t){if(n==="light")return this._loadLight(t)}createNodeAttachment(n){const t=this,i=this.parser,r=i.json.nodes[n],s=(r.extensions&&r.extensions[this.name]||{}).light;return s===void 0?null:this._loadLight(s).then(function(l){return i._getNodeRef(t.cache,s,l)})}}class tu{constructor(){this.name=Le.KHR_MATERIALS_UNLIT}getMaterialType(){return $t}extendParams(n,t,i){const a=[];n.color=new ke(1,1,1),n.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;n.color.setRGB(o[0],o[1],o[2],ut),n.opacity=o[3]}r.baseColorTexture!==void 0&&a.push(i.assignTexture(n,"map",r.baseColorTexture,Ut))}return Promise.all(a)}}class nu{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(n,t){const a=this.parser.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=a.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class iu{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_CLEARCOAT}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(i.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(i.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(i.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const s=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new st(s,s)}return Promise.all(r)}}class au{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_DISPERSION}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const a=this.parser.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=a.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class ru{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_IRIDESCENCE}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(i.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(i.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class ou{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_SHEEN}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new ke(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=a.extensions[this.name];if(o.sheenColorFactor!==void 0){const s=o.sheenColorFactor;t.sheenColor.setRGB(s[0],s[1],s[2],ut)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(i.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Ut)),o.sheenRoughnessTexture!==void 0&&r.push(i.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class su{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_TRANSMISSION}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(i.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class cu{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_VOLUME}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(i.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const s=o.attenuationColor||[1,1,1];return t.attenuationColor=new ke().setRGB(s[0],s[1],s[2],ut),Promise.all(r)}}class lu{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_IOR}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const a=this.parser.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=a.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class fu{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_SPECULAR}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(i.assignTexture(t,"specularIntensityMap",o.specularTexture));const s=o.specularColorFactor||[1,1,1];return t.specularColor=new ke().setRGB(s[0],s[1],s[2],ut),o.specularColorTexture!==void 0&&r.push(i.assignTexture(t,"specularColorMap",o.specularColorTexture,Ut)),Promise.all(r)}}class du{constructor(n){this.parser=n,this.name=Le.EXT_MATERIALS_BUMP}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(i.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class uu{constructor(n){this.parser=n,this.name=Le.KHR_MATERIALS_ANISOTROPY}getMaterialType(n){const i=this.parser.json.materials[n];return!i.extensions||!i.extensions[this.name]?null:At}extendMaterialParams(n,t){const i=this.parser,a=i.json.materials[n];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();const r=[],o=a.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(i.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class pu{constructor(n){this.parser=n,this.name=Le.KHR_TEXTURE_BASISU}loadTexture(n){const t=this.parser,i=t.json,a=i.textures[n];if(!a.extensions||!a.extensions[this.name])return null;const r=a.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(i.extensionsRequired&&i.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(n,r.source,o)}}class hu{constructor(n){this.parser=n,this.name=Le.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(n){const t=this.name,i=this.parser,a=i.json,r=a.textures[n];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],s=a.images[o.source];let l=i.textureLoader;if(s.uri){const f=i.options.manager.getHandler(s.uri);f!==null&&(l=f)}return this.detectSupport().then(function(f){if(f)return i.loadTextureImage(n,o.source,l);if(a.extensionsRequired&&a.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return i.loadTexture(n)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(n){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){n(t.height===1)}})),this.isSupported}}class mu{constructor(n){this.parser=n,this.name=Le.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(n){const t=this.name,i=this.parser,a=i.json,r=a.textures[n];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],s=a.images[o.source];let l=i.textureLoader;if(s.uri){const f=i.options.manager.getHandler(s.uri);f!==null&&(l=f)}return this.detectSupport().then(function(f){if(f)return i.loadTextureImage(n,o.source,l);if(a.extensionsRequired&&a.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return i.loadTexture(n)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(n){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){n(t.height===1)}})),this.isSupported}}class _u{constructor(n){this.name=Le.EXT_MESHOPT_COMPRESSION,this.parser=n}loadBufferView(n){const t=this.parser.json,i=t.bufferViews[n];if(i.extensions&&i.extensions[this.name]){const a=i.extensions[this.name],r=this.parser.getDependency("buffer",a.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(s){const l=a.byteOffset||0,f=a.byteLength||0,m=a.count,p=a.byteStride,_=new Uint8Array(s,l,f);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(m,p,_,a.mode,a.filter).then(function(S){return S.buffer}):o.ready.then(function(){const S=new ArrayBuffer(m*p);return o.decodeGltfBuffer(new Uint8Array(S),m,p,_,a.mode,a.filter),S})})}else return null}}class gu{constructor(n){this.name=Le.EXT_MESH_GPU_INSTANCING,this.parser=n}createNodeMesh(n){const t=this.parser.json,i=t.nodes[n];if(!i.extensions||!i.extensions[this.name]||i.mesh===void 0)return null;const a=t.meshes[i.mesh];for(const f of a.primitives)if(f.mode!==gt.TRIANGLES&&f.mode!==gt.TRIANGLE_STRIP&&f.mode!==gt.TRIANGLE_FAN&&f.mode!==void 0)return null;const o=i.extensions[this.name].attributes,s=[],l={};for(const f in o)s.push(this.parser.getDependency("accessor",o[f]).then(m=>(l[f]=m,l[f])));return s.length<1?null:(s.push(this.parser.createNodeMesh(n)),Promise.all(s).then(f=>{const m=f.pop(),p=m.isGroup?m.children:[m],_=f[0].count,S=[];for(const C of p){const A=new Mt,u=new De,c=new rr,x=new De(1,1,1),T=new Ko(C.geometry,C.material,_);for(let b=0;b<_;b++)l.TRANSLATION&&u.fromBufferAttribute(l.TRANSLATION,b),l.ROTATION&&c.fromBufferAttribute(l.ROTATION,b),l.SCALE&&x.fromBufferAttribute(l.SCALE,b),T.setMatrixAt(b,A.compose(u,c,x));for(const b in l)if(b==="_COLOR_0"){const N=l[b];T.instanceColor=new Yo(N.array,N.itemSize,N.normalized)}else b!=="TRANSLATION"&&b!=="ROTATION"&&b!=="SCALE"&&C.geometry.setAttribute(b,l[b]);or.prototype.copy.call(T,C),this.parser.assignFinalMaterial(T),S.push(T)}return m.isGroup?(m.clear(),m.add(...S),m):S[0]}))}}const hr="glTF",fn=12,ya={JSON:1313821514,BIN:5130562};class bu{constructor(n){this.name=Le.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(n,0,fn),i=new TextDecoder;if(this.header={magic:i.decode(new Uint8Array(n.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==hr)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const a=this.header.length-fn,r=new DataView(n,fn);let o=0;for(;o<a;){const s=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===ya.JSON){const f=new Uint8Array(n,fn+o,s);this.content=i.decode(f)}else if(l===ya.BIN){const f=fn+o;this.body=n.slice(f,f+s)}o+=s}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class vu{constructor(n,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Le.KHR_DRACO_MESH_COMPRESSION,this.json=n,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(n,t){const i=this.json,a=this.dracoLoader,r=n.extensions[this.name].bufferView,o=n.extensions[this.name].attributes,s={},l={},f={};for(const m in o){const p=hi[m]||m.toLowerCase();s[p]=o[m]}for(const m in n.attributes){const p=hi[m]||m.toLowerCase();if(o[m]!==void 0){const _=i.accessors[n.attributes[m]],S=tn[_.componentType];f[p]=S.name,l[p]=_.normalized===!0}}return t.getDependency("bufferView",r).then(function(m){return new Promise(function(p,_){a.decodeDracoFile(m,function(S){for(const C in S.attributes){const A=S.attributes[C],u=l[C];u!==void 0&&(A.normalized=u)}p(S)},s,f,ut,_)})})}}class Eu{constructor(){this.name=Le.KHR_TEXTURE_TRANSFORM}extendTexture(n,t){return(t.texCoord===void 0||t.texCoord===n.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(n=n.clone(),t.texCoord!==void 0&&(n.channel=t.texCoord),t.offset!==void 0&&n.offset.fromArray(t.offset),t.rotation!==void 0&&(n.rotation=t.rotation),t.scale!==void 0&&n.repeat.fromArray(t.scale),n.needsUpdate=!0),n}}class Su{constructor(){this.name=Le.KHR_MESH_QUANTIZATION}}class mr extends ps{constructor(n,t,i,a){super(n,t,i,a)}copySampleValue_(n){const t=this.resultBuffer,i=this.sampleValues,a=this.valueSize,r=n*a*3+a;for(let o=0;o!==a;o++)t[o]=i[r+o];return t}interpolate_(n,t,i,a){const r=this.resultBuffer,o=this.sampleValues,s=this.valueSize,l=s*2,f=s*3,m=a-t,p=(i-t)/m,_=p*p,S=_*p,C=n*f,A=C-f,u=-2*S+3*_,c=S-_,x=1-u,T=c-_+p;for(let b=0;b!==s;b++){const N=o[A+b+s],L=o[A+b+l]*m,U=o[C+b+s],G=o[C+b]*m;r[b]=x*N+T*L+u*U+c*G}return r}}const Tu=new rr;class xu extends mr{interpolate_(n,t,i,a){const r=super.interpolate_(n,t,i,a);return Tu.fromArray(r).normalize().toArray(r),r}}const gt={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},tn={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Ia={9728:jt,9729:Lt,9984:Ha,9985:An,9986:un,9987:Wt},Na={33071:ka,33648:Ba,10497:Dn},$n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},hi={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},It={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Mu={CUBICSPLINE:void 0,LINEAR:sr,STEP:ds},ei={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Au(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new gi({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:an})),e.DefaultMaterial}function kt(e,n,t){for(const i in t.extensions)e[i]===void 0&&(n.userData.gltfExtensions=n.userData.gltfExtensions||{},n.userData.gltfExtensions[i]=t.extensions[i])}function wt(e,n){n.extras!==void 0&&(typeof n.extras=="object"?Object.assign(e.userData,n.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+n.extras))}function Ru(e,n,t){let i=!1,a=!1,r=!1;for(let f=0,m=n.length;f<m;f++){const p=n[f];if(p.POSITION!==void 0&&(i=!0),p.NORMAL!==void 0&&(a=!0),p.COLOR_0!==void 0&&(r=!0),i&&a&&r)break}if(!i&&!a&&!r)return Promise.resolve(e);const o=[],s=[],l=[];for(let f=0,m=n.length;f<m;f++){const p=n[f];if(i){const _=p.POSITION!==void 0?t.getDependency("accessor",p.POSITION):e.attributes.position;o.push(_)}if(a){const _=p.NORMAL!==void 0?t.getDependency("accessor",p.NORMAL):e.attributes.normal;s.push(_)}if(r){const _=p.COLOR_0!==void 0?t.getDependency("accessor",p.COLOR_0):e.attributes.color;l.push(_)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(l)]).then(function(f){const m=f[0],p=f[1],_=f[2];return i&&(e.morphAttributes.position=m),a&&(e.morphAttributes.normal=p),r&&(e.morphAttributes.color=_),e.morphTargetsRelative=!0,e})}function Cu(e,n){if(e.updateMorphTargets(),n.weights!==void 0)for(let t=0,i=n.weights.length;t<i;t++)e.morphTargetInfluences[t]=n.weights[t];if(n.extras&&Array.isArray(n.extras.targetNames)){const t=n.extras.targetNames;if(e.morphTargetInfluences.length===t.length){e.morphTargetDictionary={};for(let i=0,a=t.length;i<a;i++)e.morphTargetDictionary[t[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function wu(e){let n;const t=e.extensions&&e.extensions[Le.KHR_DRACO_MESH_COMPRESSION];if(t?n="draco:"+t.bufferView+":"+t.indices+":"+ti(t.attributes):n=e.indices+":"+ti(e.attributes)+":"+e.mode,e.targets!==void 0)for(let i=0,a=e.targets.length;i<a;i++)n+=":"+ti(e.targets[i]);return n}function ti(e){let n="";const t=Object.keys(e).sort();for(let i=0,a=t.length;i<a;i++)n+=t[i]+":"+e[t[i]]+";";return n}function mi(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Pu(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?"image/jpeg":e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?"image/webp":e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const Lu=new Mt;class Du{constructor(n={},t={}){this.json=n,this.extensions={},this.plugins={},this.options=t,this.cache=new $d,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let i=!1,a=-1,r=!1,o=-1;if(typeof navigator<"u"){const s=navigator.userAgent;i=/^((?!chrome|android).)*safari/i.test(s)===!0;const l=s.match(/Version\/(\d+)/);a=i&&l?parseInt(l[1],10):-1,r=s.indexOf("Firefox")>-1,o=r?s.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||i&&a<17||r&&o<98?this.textureLoader=new Qo(this.options.manager):this.textureLoader=new Jo(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new yn(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(n){this.extensions=n}setPlugins(n){this.plugins=n}parse(n,t){const i=this,a=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([i.getDependencies("scene"),i.getDependencies("animation"),i.getDependencies("camera")])}).then(function(o){const s={scene:o[0][a.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:a.asset,parser:i,userData:{}};return kt(r,s,a),wt(s,a),Promise.all(i._invokeAll(function(l){return l.afterRoot&&l.afterRoot(s)})).then(function(){for(const l of s.scenes)l.updateMatrixWorld();n(s)})}).catch(t)}_markDefs(){const n=this.json.nodes||[],t=this.json.skins||[],i=this.json.meshes||[];for(let a=0,r=t.length;a<r;a++){const o=t[a].joints;for(let s=0,l=o.length;s<l;s++)n[o[s]].isBone=!0}for(let a=0,r=n.length;a<r;a++){const o=n[a];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(i[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(n,t){t!==void 0&&(n.refs[t]===void 0&&(n.refs[t]=n.uses[t]=0),n.refs[t]++)}_getNodeRef(n,t,i){if(n.refs[t]<=1)return i;const a=i.clone(),r=(o,s)=>{const l=this.associations.get(o);l!=null&&this.associations.set(s,l);for(const[f,m]of o.children.entries())r(m,s.children[f])};return r(i,a),a.name+="_instance_"+n.uses[t]++,a}_invokeOne(n){const t=Object.values(this.plugins);t.push(this);for(let i=0;i<t.length;i++){const a=n(t[i]);if(a)return a}return null}_invokeAll(n){const t=Object.values(this.plugins);t.unshift(this);const i=[];for(let a=0;a<t.length;a++){const r=n(t[a]);r&&i.push(r)}return i}getDependency(n,t){const i=n+":"+t;let a=this.cache.get(i);if(!a){switch(n){case"scene":a=this.loadScene(t);break;case"node":a=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":a=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":a=this.loadAccessor(t);break;case"bufferView":a=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":a=this.loadBuffer(t);break;case"material":a=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":a=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":a=this.loadSkin(t);break;case"animation":a=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":a=this.loadCamera(t);break;default:if(a=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(n,t)}),!a)throw new Error("Unknown type: "+n);break}this.cache.add(i,a)}return a}getDependencies(n){let t=this.cache.get(n);if(!t){const i=this,a=this.json[n+(n==="mesh"?"es":"s")]||[];t=Promise.all(a.map(function(r,o){return i.getDependency(n,o)})),this.cache.add(n,t)}return t}loadBuffer(n){const t=this.json.buffers[n],i=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&n===0)return Promise.resolve(this.extensions[Le.KHR_BINARY_GLTF].body);const a=this.options;return new Promise(function(r,o){i.load(mn.resolveURL(t.uri,a.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(n){const t=this.json.bufferViews[n];return this.getDependency("buffer",t.buffer).then(function(i){const a=t.byteLength||0,r=t.byteOffset||0;return i.slice(r,r+a)})}loadAccessor(n){const t=this,i=this.json,a=this.json.accessors[n];if(a.bufferView===void 0&&a.sparse===void 0){const o=$n[a.type],s=tn[a.componentType],l=a.normalized===!0,f=new s(a.count*o);return Promise.resolve(new yt(f,o,l))}const r=[];return a.bufferView!==void 0?r.push(this.getDependency("bufferView",a.bufferView)):r.push(null),a.sparse!==void 0&&(r.push(this.getDependency("bufferView",a.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",a.sparse.values.bufferView))),Promise.all(r).then(function(o){const s=o[0],l=$n[a.type],f=tn[a.componentType],m=f.BYTES_PER_ELEMENT,p=m*l,_=a.byteOffset||0,S=a.bufferView!==void 0?i.bufferViews[a.bufferView].byteStride:void 0,C=a.normalized===!0;let A,u;if(S&&S!==p){const c=Math.floor(_/S),x="InterleavedBuffer:"+a.bufferView+":"+a.componentType+":"+c+":"+a.count;let T=t.cache.get(x);T||(A=new f(s,c*S,a.count*S/m),T=new Zo(A,S/m),t.cache.add(x,T)),u=new us(T,l,_%S/m,C)}else s===null?A=new f(a.count*l):A=new f(s,_,a.count*l),u=new yt(A,l,C);if(a.sparse!==void 0){const c=$n.SCALAR,x=tn[a.sparse.indices.componentType],T=a.sparse.indices.byteOffset||0,b=a.sparse.values.byteOffset||0,N=new x(o[1],T,a.sparse.count*c),L=new f(o[2],b,a.sparse.count*l);s!==null&&(u=new yt(u.array.slice(),u.itemSize,u.normalized)),u.normalized=!1;for(let U=0,G=N.length;U<G;U++){const v=N[U];if(u.setX(v,L[U*l]),l>=2&&u.setY(v,L[U*l+1]),l>=3&&u.setZ(v,L[U*l+2]),l>=4&&u.setW(v,L[U*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}u.normalized=C}return u})}loadTexture(n){const t=this.json,i=this.options,r=t.textures[n].source,o=t.images[r];let s=this.textureLoader;if(o.uri){const l=i.manager.getHandler(o.uri);l!==null&&(s=l)}return this.loadTextureImage(n,r,s)}loadTextureImage(n,t,i){const a=this,r=this.json,o=r.textures[n],s=r.images[t],l=(s.uri||s.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const f=this.loadImageSource(t,i).then(function(m){m.flipY=!1,m.name=o.name||s.name||"",m.name===""&&typeof s.uri=="string"&&s.uri.startsWith("data:image/")===!1&&(m.name=s.uri);const _=(r.samplers||{})[o.sampler]||{};return m.magFilter=Ia[_.magFilter]||Lt,m.minFilter=Ia[_.minFilter]||Wt,m.wrapS=Na[_.wrapS]||Dn,m.wrapT=Na[_.wrapT]||Dn,m.generateMipmaps=!m.isCompressedTexture&&m.minFilter!==jt&&m.minFilter!==Lt,a.associations.set(m,{textures:n}),m}).catch(function(){return null});return this.textureCache[l]=f,f}loadImageSource(n,t){const i=this,a=this.json,r=this.options;if(this.sourceCache[n]!==void 0)return this.sourceCache[n].then(p=>p.clone());const o=a.images[n],s=self.URL||self.webkitURL;let l=o.uri||"",f=!1;if(o.bufferView!==void 0)l=i.getDependency("bufferView",o.bufferView).then(function(p){f=!0;const _=new Blob([p],{type:o.mimeType});return l=s.createObjectURL(_),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+n+" is missing URI and bufferView");const m=Promise.resolve(l).then(function(p){return new Promise(function(_,S){let C=_;t.isImageBitmapLoader===!0&&(C=function(A){const u=new rn(A);u.needsUpdate=!0,_(u)}),t.load(mn.resolveURL(p,r.path),C,void 0,S)})}).then(function(p){return f===!0&&s.revokeObjectURL(l),wt(p,o),p.userData.mimeType=o.mimeType||Pu(o.uri),p}).catch(function(p){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),p});return this.sourceCache[n]=m,m}assignTexture(n,t,i,a){const r=this;return this.getDependency("texture",i.index).then(function(o){if(!o)return null;if(i.texCoord!==void 0&&i.texCoord>0&&(o=o.clone(),o.channel=i.texCoord),r.extensions[Le.KHR_TEXTURE_TRANSFORM]){const s=i.extensions!==void 0?i.extensions[Le.KHR_TEXTURE_TRANSFORM]:void 0;if(s){const l=r.associations.get(o);o=r.extensions[Le.KHR_TEXTURE_TRANSFORM].extendTexture(o,s),r.associations.set(o,l)}}return a!==void 0&&(o.colorSpace=a),n[t]=o,o})}assignFinalMaterial(n){const t=n.geometry;let i=n.material;const a=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(n.isPoints){const s="PointsMaterial:"+i.uuid;let l=this.cache.get(s);l||(l=new $o,jn.prototype.copy.call(l,i),l.color.copy(i.color),l.map=i.map,l.sizeAttenuation=!1,this.cache.add(s,l)),i=l}else if(n.isLine){const s="LineBasicMaterial:"+i.uuid;let l=this.cache.get(s);l||(l=new es,jn.prototype.copy.call(l,i),l.color.copy(i.color),l.map=i.map,this.cache.add(s,l)),i=l}if(a||r||o){let s="ClonedMaterial:"+i.uuid+":";a&&(s+="derivative-tangents:"),r&&(s+="vertex-colors:"),o&&(s+="flat-shading:");let l=this.cache.get(s);l||(l=i.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),a&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(s,l),this.associations.set(l,this.associations.get(i))),i=l}n.material=i}getMaterialType(){return gi}loadMaterial(n){const t=this,i=this.json,a=this.extensions,r=i.materials[n];let o;const s={},l=r.extensions||{},f=[];if(l[Le.KHR_MATERIALS_UNLIT]){const p=a[Le.KHR_MATERIALS_UNLIT];o=p.getMaterialType(),f.push(p.extendParams(s,r,t))}else{const p=r.pbrMetallicRoughness||{};if(s.color=new ke(1,1,1),s.opacity=1,Array.isArray(p.baseColorFactor)){const _=p.baseColorFactor;s.color.setRGB(_[0],_[1],_[2],ut),s.opacity=_[3]}p.baseColorTexture!==void 0&&f.push(t.assignTexture(s,"map",p.baseColorTexture,Ut)),s.metalness=p.metallicFactor!==void 0?p.metallicFactor:1,s.roughness=p.roughnessFactor!==void 0?p.roughnessFactor:1,p.metallicRoughnessTexture!==void 0&&(f.push(t.assignTexture(s,"metalnessMap",p.metallicRoughnessTexture)),f.push(t.assignTexture(s,"roughnessMap",p.metallicRoughnessTexture))),o=this._invokeOne(function(_){return _.getMaterialType&&_.getMaterialType(n)}),f.push(Promise.all(this._invokeAll(function(_){return _.extendMaterialParams&&_.extendMaterialParams(n,s)})))}r.doubleSided===!0&&(s.side=xt);const m=r.alphaMode||ei.OPAQUE;if(m===ei.BLEND?(s.transparent=!0,s.depthWrite=!1):(s.transparent=!1,m===ei.MASK&&(s.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==$t&&(f.push(t.assignTexture(s,"normalMap",r.normalTexture)),s.normalScale=new st(1,1),r.normalTexture.scale!==void 0)){const p=r.normalTexture.scale;s.normalScale.set(p,p)}if(r.occlusionTexture!==void 0&&o!==$t&&(f.push(t.assignTexture(s,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(s.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==$t){const p=r.emissiveFactor;s.emissive=new ke().setRGB(p[0],p[1],p[2],ut)}return r.emissiveTexture!==void 0&&o!==$t&&f.push(t.assignTexture(s,"emissiveMap",r.emissiveTexture,Ut)),Promise.all(f).then(function(){const p=new o(s);return r.name&&(p.name=r.name),wt(p,r),t.associations.set(p,{materials:n}),r.extensions&&kt(a,p,r),p})}createUniqueName(n){const t=ts.sanitizeNodeName(n||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(n){const t=this,i=this.extensions,a=this.primitiveCache;function r(s){return i[Le.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(s,t).then(function(l){return Oa(l,s,t)})}const o=[];for(let s=0,l=n.length;s<l;s++){const f=n[s],m=wu(f),p=a[m];if(p)o.push(p.promise);else{let _;f.extensions&&f.extensions[Le.KHR_DRACO_MESH_COMPRESSION]?_=r(f):_=Oa(new Nn,f,t),a[m]={primitive:f,promise:_},o.push(_)}}return Promise.all(o)}loadMesh(n){const t=this,i=this.json,a=this.extensions,r=i.meshes[n],o=r.primitives,s=[];for(let l=0,f=o.length;l<f;l++){const m=o[l].material===void 0?Au(this.cache):this.getDependency("material",o[l].material);s.push(m)}return s.push(t.loadGeometries(o)),Promise.all(s).then(function(l){const f=l.slice(0,l.length-1),m=l[l.length-1],p=[];for(let S=0,C=m.length;S<C;S++){const A=m[S],u=o[S];let c;const x=f[S];if(u.mode===gt.TRIANGLES||u.mode===gt.TRIANGLE_STRIP||u.mode===gt.TRIANGLE_FAN||u.mode===void 0)c=r.isSkinnedMesh===!0?new ns(A,x):new Dt(A,x),c.isSkinnedMesh===!0&&c.normalizeSkinWeights(),u.mode===gt.TRIANGLE_STRIP?c.geometry=Ua(c.geometry,ir):u.mode===gt.TRIANGLE_FAN&&(c.geometry=Ua(c.geometry,ui));else if(u.mode===gt.LINES)c=new is(A,x);else if(u.mode===gt.LINE_STRIP)c=new as(A,x);else if(u.mode===gt.LINE_LOOP)c=new rs(A,x);else if(u.mode===gt.POINTS)c=new os(A,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+u.mode);Object.keys(c.geometry.morphAttributes).length>0&&Cu(c,r),c.name=t.createUniqueName(r.name||"mesh_"+n),wt(c,r),u.extensions&&kt(a,c,u),t.assignFinalMaterial(c),p.push(c)}for(let S=0,C=p.length;S<C;S++)t.associations.set(p[S],{meshes:n,primitives:S});if(p.length===1)return r.extensions&&kt(a,p[0],r),p[0];const _=new Cn;r.extensions&&kt(a,_,r),t.associations.set(_,{meshes:n});for(let S=0,C=p.length;S<C;S++)_.add(p[S]);return _})}loadCamera(n){let t;const i=this.json.cameras[n],a=i[i.type];if(!a){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return i.type==="perspective"?t=new hn(ss.radToDeg(a.yfov),a.aspectRatio||1,a.znear||1,a.zfar||2e6):i.type==="orthographic"&&(t=new nr(-a.xmag,a.xmag,a.ymag,-a.ymag,a.znear,a.zfar)),i.name&&(t.name=this.createUniqueName(i.name)),wt(t,i),Promise.resolve(t)}loadSkin(n){const t=this.json.skins[n],i=[];for(let a=0,r=t.joints.length;a<r;a++)i.push(this._loadNodeShallow(t.joints[a]));return t.inverseBindMatrices!==void 0?i.push(this.getDependency("accessor",t.inverseBindMatrices)):i.push(null),Promise.all(i).then(function(a){const r=a.pop(),o=a,s=[],l=[];for(let f=0,m=o.length;f<m;f++){const p=o[f];if(p){s.push(p);const _=new Mt;r!==null&&_.fromArray(r.array,f*16),l.push(_)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[f])}return new cs(s,l)})}loadAnimation(n){const t=this.json,i=this,a=t.animations[n],r=a.name?a.name:"animation_"+n,o=[],s=[],l=[],f=[],m=[];for(let p=0,_=a.channels.length;p<_;p++){const S=a.channels[p],C=a.samplers[S.sampler],A=S.target,u=A.node,c=a.parameters!==void 0?a.parameters[C.input]:C.input,x=a.parameters!==void 0?a.parameters[C.output]:C.output;A.node!==void 0&&(o.push(this.getDependency("node",u)),s.push(this.getDependency("accessor",c)),l.push(this.getDependency("accessor",x)),f.push(C),m.push(A))}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(l),Promise.all(f),Promise.all(m)]).then(function(p){const _=p[0],S=p[1],C=p[2],A=p[3],u=p[4],c=[];for(let x=0,T=_.length;x<T;x++){const b=_[x],N=S[x],L=C[x],U=A[x],G=u[x];if(b===void 0)continue;b.updateMatrix&&b.updateMatrix();const v=i._createAnimationTracks(b,N,L,U,G);if(v)for(let g=0;g<v.length;g++)c.push(v[g])}return new ls(r,void 0,c)})}createNodeMesh(n){const t=this.json,i=this,a=t.nodes[n];return a.mesh===void 0?null:i.getDependency("mesh",a.mesh).then(function(r){const o=i._getNodeRef(i.meshCache,a.mesh,r);return a.weights!==void 0&&o.traverse(function(s){if(s.isMesh)for(let l=0,f=a.weights.length;l<f;l++)s.morphTargetInfluences[l]=a.weights[l]}),o})}loadNode(n){const t=this.json,i=this,a=t.nodes[n],r=i._loadNodeShallow(n),o=[],s=a.children||[];for(let f=0,m=s.length;f<m;f++)o.push(i.getDependency("node",s[f]));const l=a.skin===void 0?Promise.resolve(null):i.getDependency("skin",a.skin);return Promise.all([r,Promise.all(o),l]).then(function(f){const m=f[0],p=f[1],_=f[2];_!==null&&m.traverse(function(S){S.isSkinnedMesh&&S.bind(_,Lu)});for(let S=0,C=p.length;S<C;S++)m.add(p[S]);return m})}_loadNodeShallow(n){const t=this.json,i=this.extensions,a=this;if(this.nodeCache[n]!==void 0)return this.nodeCache[n];const r=t.nodes[n],o=r.name?a.createUniqueName(r.name):"",s=[],l=a._invokeOne(function(f){return f.createNodeMesh&&f.createNodeMesh(n)});return l&&s.push(l),r.camera!==void 0&&s.push(a.getDependency("camera",r.camera).then(function(f){return a._getNodeRef(a.cameraCache,r.camera,f)})),a._invokeAll(function(f){return f.createNodeAttachment&&f.createNodeAttachment(n)}).forEach(function(f){s.push(f)}),this.nodeCache[n]=Promise.all(s).then(function(f){let m;if(r.isBone===!0?m=new fs:f.length>1?m=new Cn:f.length===1?m=f[0]:m=new or,m!==f[0])for(let p=0,_=f.length;p<_;p++)m.add(f[p]);if(r.name&&(m.userData.name=r.name,m.name=o),wt(m,r),r.extensions&&kt(i,m,r),r.matrix!==void 0){const p=new Mt;p.fromArray(r.matrix),m.applyMatrix4(p)}else r.translation!==void 0&&m.position.fromArray(r.translation),r.rotation!==void 0&&m.quaternion.fromArray(r.rotation),r.scale!==void 0&&m.scale.fromArray(r.scale);return a.associations.has(m)||a.associations.set(m,{}),a.associations.get(m).nodes=n,m}),this.nodeCache[n]}loadScene(n){const t=this.extensions,i=this.json.scenes[n],a=this,r=new Cn;i.name&&(r.name=a.createUniqueName(i.name)),wt(r,i),i.extensions&&kt(t,r,i);const o=i.nodes||[],s=[];for(let l=0,f=o.length;l<f;l++)s.push(a.getDependency("node",o[l]));return Promise.all(s).then(function(l){for(let m=0,p=l.length;m<p;m++)r.add(l[m]);const f=m=>{const p=new Map;for(const[_,S]of a.associations)(_ instanceof jn||_ instanceof rn)&&p.set(_,S);return m.traverse(_=>{const S=a.associations.get(_);S!=null&&p.set(_,S)}),p};return a.associations=f(r),r})}_createAnimationTracks(n,t,i,a,r){const o=[],s=n.name?n.name:n.uuid,l=[];It[r.path]===It.weights?n.traverse(function(_){_.morphTargetInfluences&&l.push(_.name?_.name:_.uuid)}):l.push(s);let f;switch(It[r.path]){case It.weights:f=oa;break;case It.rotation:f=sa;break;case It.position:case It.scale:f=ra;break;default:switch(i.itemSize){case 1:f=oa;break;case 2:case 3:default:f=ra;break}break}const m=a.interpolation!==void 0?Mu[a.interpolation]:sr,p=this._getArrayFromAccessor(i);for(let _=0,S=l.length;_<S;_++){const C=new f(l[_]+"."+It[r.path],t.array,p,m);a.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(C),o.push(C)}return o}_getArrayFromAccessor(n){let t=n.array;if(n.normalized){const i=mi(t.constructor),a=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)a[r]=t[r]*i;t=a}return t}_createCubicSplineTrackInterpolant(n){n.createInterpolant=function(i){const a=this instanceof sa?xu:mr;return new a(this.times,this.values,this.getValueSize()/3,i)},n.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Uu(e,n,t){const i=n.attributes,a=new cr;if(i.POSITION!==void 0){const s=t.json.accessors[i.POSITION],l=s.min,f=s.max;if(l!==void 0&&f!==void 0){if(a.set(new De(l[0],l[1],l[2]),new De(f[0],f[1],f[2])),s.normalized){const m=mi(tn[s.componentType]);a.min.multiplyScalar(m),a.max.multiplyScalar(m)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=n.targets;if(r!==void 0){const s=new De,l=new De;for(let f=0,m=r.length;f<m;f++){const p=r[f];if(p.POSITION!==void 0){const _=t.json.accessors[p.POSITION],S=_.min,C=_.max;if(S!==void 0&&C!==void 0){if(l.setX(Math.max(Math.abs(S[0]),Math.abs(C[0]))),l.setY(Math.max(Math.abs(S[1]),Math.abs(C[1]))),l.setZ(Math.max(Math.abs(S[2]),Math.abs(C[2]))),_.normalized){const A=mi(tn[_.componentType]);l.multiplyScalar(A)}s.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}a.expandByVector(s)}e.boundingBox=a;const o=new hs;a.getCenter(o.center),o.radius=a.min.distanceTo(a.max)/2,e.boundingSphere=o}function Oa(e,n,t){const i=n.attributes,a=[];function r(o,s){return t.getDependency("accessor",o).then(function(l){e.setAttribute(s,l)})}for(const o in i){const s=hi[o]||o.toLowerCase();s in e.attributes||a.push(r(i[o],s))}if(n.indices!==void 0&&!e.index){const o=t.getDependency("accessor",n.indices).then(function(s){e.setIndex(s)});a.push(o)}return Je.workingColorSpace!==ut&&"COLOR_0"in i&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Je.workingColorSpace}" not supported.`),wt(e,n),Uu(e,n,t),Promise.all(a).then(function(){return n.targets!==void 0?Ru(e,n.targets,t):e})}const ni=new WeakMap;class yu extends ar{constructor(n){super(n),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(n){return this.decoderPath=n,this}setDecoderConfig(n){return this.decoderConfig=n,this}setWorkerLimit(n){return this.workerLimit=n,this}load(n,t,i,a){const r=new yn(this.manager);r.setPath(this.path),r.setResponseType("arraybuffer"),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials),r.load(n,o=>{this.parse(o,t,a)},i,a)}parse(n,t,i=()=>{}){this.decodeDracoFile(n,t,null,null,Ut,i).catch(i)}decodeDracoFile(n,t,i,a,r=ut,o=()=>{}){const s={attributeIDs:i||this.defaultAttributeIDs,attributeTypes:a||this.defaultAttributeTypes,useUniqueIDs:!!i,vertexColorSpace:r};return this.decodeGeometry(n,s).then(t).catch(o)}decodeGeometry(n,t){const i=JSON.stringify(t);if(ni.has(n)){const l=ni.get(n);if(l.key===i)return l.promise;if(n.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let a;const r=this.workerNextTaskID++,o=n.byteLength,s=this._getWorker(r,o).then(l=>(a=l,new Promise((f,m)=>{a._callbacks[r]={resolve:f,reject:m},a.postMessage({type:"decode",id:r,taskConfig:t,buffer:n},[n])}))).then(l=>this._createGeometry(l.geometry));return s.catch(()=>!0).then(()=>{a&&r&&this._releaseTask(a,r)}),ni.set(n,{key:i,promise:s}),s}_createGeometry(n){const t=new Nn;n.index&&t.setIndex(new yt(n.index.array,1));for(let i=0;i<n.attributes.length;i++){const a=n.attributes[i],r=a.name,o=a.array,s=a.itemSize,l=new yt(o,s);r==="color"&&(this._assignVertexColorSpace(l,a.vertexColorSpace),l.normalized=!(o instanceof Float32Array)),t.setAttribute(r,l)}return t}_assignVertexColorSpace(n,t){if(t!==Ut)return;const i=new ke;for(let a=0,r=n.count;a<r;a++)i.fromBufferAttribute(n,a),Je.toWorkingColorSpace(i,Ut),n.setXYZ(a,i.r,i.g,i.b)}_loadLibrary(n,t){const i=new yn(this.manager);return i.setPath(this.decoderPath),i.setResponseType(t),i.setWithCredentials(this.withCredentials),new Promise((a,r)=>{i.load(n,a,void 0,r)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const n=typeof WebAssembly!="object"||this.decoderConfig.type==="js",t=[];return n?t.push(this._loadLibrary("draco_decoder.js","text")):(t.push(this._loadLibrary("draco_wasm_wrapper.js","text")),t.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(t).then(i=>{const a=i[0];n||(this.decoderConfig.wasmBinary=i[1]);const r=Iu.toString(),o=["/* draco decoder */",a,"","/* worker */",r.substring(r.indexOf("{")+1,r.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([o]))}),this.decoderPending}_getWorker(n,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const a=new Worker(this.workerSourceURL);a._callbacks={},a._taskCosts={},a._taskLoad=0,a.postMessage({type:"init",decoderConfig:this.decoderConfig}),a.onmessage=function(r){const o=r.data;switch(o.type){case"decode":a._callbacks[o.id].resolve(o);break;case"error":a._callbacks[o.id].reject(o);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+o.type+'"')}},this.workerPool.push(a)}else this.workerPool.sort(function(a,r){return a._taskLoad>r._taskLoad?-1:1});const i=this.workerPool[this.workerPool.length-1];return i._taskCosts[n]=t,i._taskLoad+=t,i})}_releaseTask(n,t){n._taskLoad-=n._taskCosts[t],delete n._callbacks[t],delete n._taskCosts[t]}debug(){console.log("Task load: ",this.workerPool.map(n=>n._taskLoad))}dispose(){for(let n=0;n<this.workerPool.length;++n)this.workerPool[n].terminate();return this.workerPool.length=0,this.workerSourceURL!==""&&URL.revokeObjectURL(this.workerSourceURL),this}}function Iu(){let e,n;onmessage=function(o){const s=o.data;switch(s.type){case"init":e=s.decoderConfig,n=new Promise(function(m){e.onModuleLoaded=function(p){m({draco:p})},DracoDecoderModule(e)});break;case"decode":const l=s.buffer,f=s.taskConfig;n.then(m=>{const p=m.draco,_=new p.Decoder;try{const S=t(p,_,new Int8Array(l),f),C=S.attributes.map(A=>A.array.buffer);S.index&&C.push(S.index.array.buffer),self.postMessage({type:"decode",id:s.id,geometry:S},C)}catch(S){console.error(S),self.postMessage({type:"error",id:s.id,error:S.message})}finally{p.destroy(_)}});break}};function t(o,s,l,f){const m=f.attributeIDs,p=f.attributeTypes;let _,S;const C=s.GetEncodedGeometryType(l);if(C===o.TRIANGULAR_MESH)_=new o.Mesh,S=s.DecodeArrayToMesh(l,l.byteLength,_);else if(C===o.POINT_CLOUD)_=new o.PointCloud,S=s.DecodeArrayToPointCloud(l,l.byteLength,_);else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");if(!S.ok()||_.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+S.error_msg());const A={index:null,attributes:[]};for(const u in m){const c=self[p[u]];let x,T;if(f.useUniqueIDs)T=m[u],x=s.GetAttributeByUniqueId(_,T);else{if(T=s.GetAttributeId(_,o[m[u]]),T===-1)continue;x=s.GetAttribute(_,T)}const b=a(o,s,_,u,c,x);u==="color"&&(b.vertexColorSpace=f.vertexColorSpace),A.attributes.push(b)}return C===o.TRIANGULAR_MESH&&(A.index=i(o,s,_)),o.destroy(_),A}function i(o,s,l){const m=l.num_faces()*3,p=m*4,_=o._malloc(p);s.GetTrianglesUInt32Array(l,p,_);const S=new Uint32Array(o.HEAPF32.buffer,_,m).slice();return o._free(_),{array:S,itemSize:1}}function a(o,s,l,f,m,p){const _=p.num_components(),C=l.num_points()*_,A=C*m.BYTES_PER_ELEMENT,u=r(o,m),c=o._malloc(A);s.GetAttributeDataArrayForAllPoints(l,p,u,A,c);const x=new m(o.HEAPF32.buffer,c,C).slice();return o._free(c),{name:f,array:x,itemSize:_}}function r(o,s){switch(s){case Float32Array:return o.DT_FLOAT32;case Int8Array:return o.DT_INT8;case Int16Array:return o.DT_INT16;case Int32Array:return o.DT_INT32;case Uint8Array:return o.DT_UINT8;case Uint16Array:return o.DT_UINT16;case Uint32Array:return o.DT_UINT32}}}var Mn=(function(){var e="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q;iekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq:P8Yqdbk;3sezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhDcbhqinaqae9pmeaDaeaq9RaqaDfae6Egkcsfgocl4cifcd4hxdndndndnaoc9WGgmTmbcbhPcehsawcjdfhzalhHinaraH9Rax6midnaraHaxfgl9RcK6mbczhoinawcj;cbfaogifgoc9WfhOdndndndndnaHaic9WfgAco4fRbbaAci4coG4ciGPlbedibkaO9cb83ibaOcwf9cb83ibxikaOalRblalRbbgAco4gCaCciSgCE86bbaocGfalclfaCfgORbbaAcl4ciGgCaCciSgCE86bbaocVfaOaCfgORbbaAcd4ciGgCaCciSgCE86bbaoc7faOaCfgORbbaAciGgAaAciSgAE86bbaoctfaOaAfgARbbalRbegOco4gCaCciSgCE86bbaoc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc93faAaCfgARbbaOciGgOaOciSgOE86bbaoc94faAaOfgARbbalRbdgOco4gCaCciSgCE86bbaoc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc97faAaCfgARbbaOciGgOaOciSgOE86bbaoc98faAaOfgORbbalRbiglco4gAaAciSgAE86bbaoc99faOaAfgORbbalcl4ciGgAaAciSgAE86bbaoc9:faOaAfgORbbalcd4ciGgAaAciSgAE86bbaocufaOaAfgoRbbalciGglalciSglE86bbaoalfhlxdkaOalRbwalRbbgAcl4gCaCcsSgCE86bbaocGfalcwfaCfgORbbaAcsGgAaAcsSgAE86bbaocVfaOaAfgORbbalRbegAcl4gCaCcsSgCE86bbaoc7faOaCfgORbbaAcsGgAaAcsSgAE86bbaoctfaOaAfgORbbalRbdgAcl4gCaCcsSgCE86bbaoc91faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc4faOaAfgORbbalRbigAcl4gCaCcsSgCE86bbaoc93faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc94faOaAfgORbbalRblgAcl4gCaCcsSgCE86bbaoc95faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc96faOaAfgORbbalRbvgAcl4gCaCcsSgCE86bbaoc97faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc98faOaAfgORbbalRbogAcl4gCaCcsSgCE86bbaoc99faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc9:faOaAfgORbbalRbrglcl4gAaAcsSgAE86bbaocufaOaAfgoRbbalcsGglalcsSglE86bbaoalfhlxekaOal8Pbb83bbaOcwfalcwf8Pbb83bbalczfhlkdnaiam9pmbaiczfhoaral9RcL0mekkaiam6mialTmidnakTmbawaPfRbbhOcbhoazhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkkazcefhzaPcefgPad6hsalhHaPad9hmexvkkcbhlasceGmdxikalaxad2fhCdnakTmbcbhHcehsawcjdfhminaral9Rax6mialTmdalaxfhlawaHfRbbhOcbhoamhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkamcefhmaHcefgHad6hsaHad9hmbkaChlxikcbhocehsinaral9Rax6mdalTmealaxfhlaocefgoad6hsadao9hmbkaChlxdkcbhlasceGTmekc9:hoxikabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqalmbkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;ebf8Kjjjjbaok;yzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;siliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabavcefciGaiVcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:Ohkxekcjjjj94hkkabavcdfciGaiVcetfak87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:Ohqxekcjjjj94hqkabavcufciGaiVcetfaq87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohqxekcjjjj94hqkabavciGaiVcetfaq87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2geTmbinababydbgdcwtcw91:Yadce91cjjj;8ifcjjj98G::NUdbabclfhbaecufgembkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaiczfhiaeczfheadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklz9Kbb",n="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q;Aekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq;t9tqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk;h8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhwcbhDinaDae9pmeawaeaD9RaDawfae6Egqcsfgoc9WGgkci2hxakcethmaocl4cifcd4hPabaDad2fhscbhzdnincehHalhOcbhAdninaraO9RaP6miavcj;cbfaAak2fhCaOaPfhlcbhidnakc;ab6mbaral9Rc;Gb6mbcbhoinaCaofhidndndndndnaOaoco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklbalczfhlkdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklzalczfhlkdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklaalczfhlkdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalclfaYpQbfaXc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalcwfaYpQbfaXc:q:yjjbfRbbfhlxekaialpbbbpkl8Walczfhlkaoc;abfhiaocjefak0meaihoaral9Rc;Fb0mbkkdndnaiak9pmbaici4hoinaral9RcK6mdaCaifhXdndndndndnaOaico4fRbbaocoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpklbxikaXalpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaXalpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaXalpbbbpklbalczfhlkaocdfhoaiczfgiak6mbkkalTmbaAci6hHalhOaAcefgohAaoclSmdxekkcbhlaHceGmdkdnakTmbavcjdfazfhiavazfpbdbhYcbhXinaiavcj;cbfaXfgopblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLaoakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEaoamfpblbg3cep9Ta3aQp9op9Hp9rg3aoaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfhiaXczfgXak6mbkkazclfgzad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfhDc9:hoalmexikkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk;uzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:EPliuo97eue978Jjjjjbca9Rhidndnadcl9hmbdnaec98GglTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalae9pmeaiaeciGgvcdtgdVcbczad9R;8kbaiabalcdtfglad;8qbbdnavTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkalaiad;8qbbskdnaec98GgxTmbcbhvabhdinadczfglalpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oawaopmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgvax6mbkkaxae9pmbaiaeciGgvcitgdfcbcaad9R;8kbaiabaxcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oawaopmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalae9pmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbhdabheinaeaepbbbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepkbbaeczfheadclfgdav6mbkkdnaval9pmbaialciGgdcdtgeVcbc;abae9R;8kbaiabavcdtfgvae;8qbbdnadTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepklbkavaiae;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz9Tbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),i=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var a=WebAssembly.validate(t)?n:e,r,o=WebAssembly.instantiate(s(a),{}).then(function(c){r=c.instance,r.exports.__wasm_call_ctors()});function s(c){for(var x=new Uint8Array(c.length),T=0;T<c.length;++T){var b=c.charCodeAt(T);x[T]=b>96?b-97:b>64?b-39:b+4}for(var N=0,T=0;T<c.length;++T)x[N++]=x[T]<60?i[x[T]]:(x[T]-60)*64+x[++T];return x.buffer.slice(0,N)}function l(c,x,T,b,N,L){var U=r.exports.sbrk,G=T+3&-4,v=U(G*b),g=U(N.length),D=new Uint8Array(r.exports.memory.buffer);D.set(N,g);var j=c(v,T,b,g,N.length);if(j==0&&L&&L(v,G,b),x.set(D.subarray(v,v+T*b)),U(v-U(0)),j!=0)throw new Error("Malformed buffer data: "+j)}var f={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},m={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},p=[],_=0;function S(c){var x={object:new Worker(c),pending:0,requests:{}};return x.object.onmessage=function(T){var b=T.data;x.pending-=b.count,x.requests[b.id][b.action](b.value),delete x.requests[b.id]},x}function C(c){for(var x="var instance; var ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(s(a))+"]), {}).then(function(result) { instance = result.instance; instance.exports.__wasm_call_ctors(); });self.onmessage = workerProcess;"+l.toString()+u.toString(),T=new Blob([x],{type:"text/javascript"}),b=URL.createObjectURL(T),N=0;N<c;++N)p[N]=S(b);URL.revokeObjectURL(b)}function A(c,x,T,b,N){for(var L=p[0],U=1;U<p.length;++U)p[U].pending<L.pending&&(L=p[U]);return new Promise(function(G,v){var g=new Uint8Array(T),D=_++;L.pending+=c,L.requests[D]={resolve:G,reject:v},L.object.postMessage({id:D,count:c,size:x,source:g,mode:b,filter:N},[g.buffer])})}function u(c){o.then(function(){var x=c.data;try{var T=new Uint8Array(x.count*x.size);l(r.exports[x.mode],T,x.count,x.size,x.source,r.exports[x.filter]),self.postMessage({id:x.id,count:x.count,action:"resolve",value:T},[T.buffer])}catch(b){self.postMessage({id:x.id,count:x.count,action:"reject",value:b})}})}return{ready:o,supported:!0,useWorkers:function(c){C(c)},decodeVertexBuffer:function(c,x,T,b,N){l(r.exports.meshopt_decodeVertexBuffer,c,x,T,b,r.exports[f[N]])},decodeIndexBuffer:function(c,x,T,b){l(r.exports.meshopt_decodeIndexBuffer,c,x,T,b)},decodeIndexSequence:function(c,x,T,b){l(r.exports.meshopt_decodeIndexSequence,c,x,T,b)},decodeGltfBuffer:function(c,x,T,b,N,L){l(r.exports[m[N]],c,x,T,b,r.exports[f[L]])},decodeGltfBufferAsync:function(c,x,T,b,N){return p.length>0?A(c,x,T,m[b],f[N]):o.then(function(){var L=new Uint8Array(c*x);return l(r.exports[m[b]],L,c,x,T,r.exports[f[N]]),L})}}})();function Nu(e){const n=new Map,t=new Map,i=e.clone();return _r(e,i,function(a,r){n.set(r,a),t.set(a,r)}),i.traverse(function(a){if(!a.isSkinnedMesh)return;const r=a,o=n.get(a),s=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=s.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),i}function _r(e,n,t){t(e,n);for(let i=0;i<e.children.length;i++)_r(e.children[i],n.children[i],t)}let dn=null;function Ou(){var e;if(!dn){const n=new yu;n.setDecoderPath(new URL("./draco/",window.location.href).href),dn=new Zd,dn.setDRACOLoader(n);try{(e=Mn.useWorkers)==null||e.call(Mn,Math.min(2,Math.max(1,(navigator.hardwareConcurrency||2)-1)))}catch{}dn.setMeshoptDecoder(Mn)}return dn}async function Fu(e){const n=Ou();if(typeof e=="string"){const a=await n.loadAsync(e);return{scene:a.scene,animations:a.animations||[]}}const t=e instanceof Blob?await e.arrayBuffer():e,i=await n.parseAsync(t,"");return{scene:i.scene,animations:i.animations||[]}}const Gu=ms(),Bu=Gu?1024:2048;async function ku(e,n){const t=e;if(!(t!=null&&t.width)||!t.height)return null;const i=n/Math.max(t.width,t.height);if(i>=1)return null;const a=Math.max(1,Math.round(t.width*i)),r=Math.max(1,Math.round(t.height*i)),o=e;try{return await createImageBitmap(o,{resizeWidth:a,resizeHeight:r,resizeQuality:"high",premultiplyAlpha:"none",colorSpaceConversion:"none"})}catch{const s=document.createElement("canvas");s.width=a,s.height=r;const l=s.getContext("2d");return l?(l.imageSmoothingQuality="high",l.drawImage(o,0,0,a,r),s):null}}async function Hu(e){const n=new Set,t=new Map;e.traverse(a=>{const r=a;if(!r.material)return;const s=(Array.isArray(r.material)?r.material:[r.material]).map(l=>{const f=l;if(!f.isMeshPhysicalMaterial||!(f.transmission>0))return l;const m=t.get(l);if(m)return m;const p=new gi().copy(f);return p.transparent=!0,p.opacity=Math.min(f.opacity,1-f.transmission*.7),p.depthWrite=!1,f.dispose(),t.set(l,p),p});r.material=Array.isArray(r.material)?s:s[0];for(const l of s)for(const f of Object.values(l))f instanceof rn&&n.add(f)});const i=new Map;n.forEach(a=>{a.image&&i.set(a.image,[...i.get(a.image)??[],a])}),await Promise.all([...i].map(async([a,r])=>{var o;try{const s=await ku(a,Bu);if(!s)return;for(const l of r)l.image=s,l.needsUpdate=!0;(o=a.close)==null||o.call(a)}catch(s){console.warn("Texture kept at full size:",s)}}))}const Vu=navigator.deviceMemory||2,zu=Math.min(256,Math.max(64,Vu*48))*1048576,Wu=8,Tt=new Map;function Xu(e){const n=new Set;let t=0;return e.traverse(i=>{const a=i;if(a.geometry&&!n.has(a.geometry)){n.add(a.geometry);const o=a.geometry;Object.values(o.attributes).forEach(s=>t+=s.array.byteLength),o.index&&(t+=o.index.array.byteLength)}const r=Array.isArray(a.material)?a.material:a.material?[a.material]:[];for(const o of r)for(const s of Object.values(o)){if(!(s instanceof rn)||n.has(s))continue;n.add(s);const l=s.image;t+=((l==null?void 0:l.width)||0)*((l==null?void 0:l.height)||0)*4}}),t}function ju(e){let n=0;Tt.forEach(t=>n+=t.bytes);for(const[t,i]of Tt)if(t!==e){if(n<=zu&&Tt.size<=Wu)break;Tt.delete(t),n-=i.bytes}}async function Qu(e,n){let t=Tt.get(e);if(t)Tt.delete(e),Tt.set(e,t);else{const r=(async()=>{const s=await n();if(!s)throw new Error("missing");const l=await Fu(s);return await Hu(l.scene),l})();t={result:r,bytes:0},Tt.set(e,t);const o=t;r.then(s=>{o.bytes=Xu(s.scene),ju(e)},()=>Tt.get(e)===o&&Tt.delete(e))}const{scene:i,animations:a}=await t.result;return{scene:Nu(i),animations:a}}function Ju(e,n){e.updateMatrixWorld(!0);const t=new cr().setFromObject(e),i=new Cn;if(i.add(e),t.isEmpty())return{pivot:i,scale:n??1};const a=t.getSize(new De),r=t.getCenter(new De),o=a.y>Math.max(a.x,a.z)*.2?a.y:Math.max(a.x,a.y,a.z),s=n??(o>0?1/o:1);return e.scale.multiplyScalar(s),e.position.set(-r.x*s,-t.min.y*s,-r.z*s),{pivot:i,scale:s}}export{Yu as W,Fu as a,Qu as l,Ju as n};
