<!DOCTYPE html>
<html lang="en">

<head>
	<title>GLTF loader</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<!--<link type="text/css" rel="stylesheet" href="main.css">	-->
</head>

<body>
		
	<div>
	
		<div nameId="progress_wrap" style="display: none; position: absolute; top: 50%; left: 50%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); width: auto; padding: 20px; opacity: 0.6; border:solid 1px #b3b3b3; border-radius: 9px; background: #fff; z-index: 1;">				
			<div nameId="progress_load" style="font:32px Arial, Helvetica, sans-serif; text-align: center; color: #222;">загрузка</div>			
		</div>

		<div style="position: absolute; top: 20px; left: 50%; z-index: 1">

			<input name="file" type="file" id="load_obj_1" style="opacity: 0; visibility: hidden; position: absolute;">
			<label for="load_obj_1" style="display: block; width: auto; height: 20px; margin: auto; text-decoration: none; text-align: center; padding: 11px 11px; border: solid 1px #b3b3b3; border-radius: 4px; font: 18px Arial, Helvetica, sans-serif; font-weight: bold; color: #737373; box-shadow: 0px 0px 2px #bababa, inset 0px 0px 1px #ffffff; background-image: -webkit-linear-gradient(top, #ffffff 0%, #e3e3e3 100%); cursor: pointer;">
				загрузить fbx
			</label>

		</div>

		<div style="position: absolute; left: 50px; bottom: 80px; z-index: 1">				

			<div nameId='div_triangles_1' style="width: 160px; border:solid 1px #b3b3b3; background: #fff; text-align:center; font-family: arial,sans-serif; font-size: 15px; color: #666;">
				triangles:						
			</div>

			<div nameId='div_countMesh_1' style="width: 160px; border:solid 1px #b3b3b3; background: #fff; text-align:center; font-family: arial,sans-serif; font-size: 15px; color: #666;">
				mesh:						
			</div>

			<div nameId='div_countMaterial_1' style="width: 160px; border:solid 1px #b3b3b3; background: #fff; text-align:center; font-family: arial,sans-serif; font-size: 15px; color: #666;">
				material:						
			</div>						
		</div>

	</div>
	
					
		
    <script type="module" src="index.js<?='?t='.time() ?>"></script>



</body>


</html>