const {PrismaClient}=require("@prisma/client");const p=new PrismaClient();
(async()=>{
 const direction=await p.user.findUniqueOrThrow({where:{email:"direction@topcarzone.com"}});
 const u=await p.user.upsert({where:{email:"test-garage@carzone.bj"},update:{role:"COMPTA_GARAGE",active:true,passwordHash:direction.passwordHash,siteId:direction.siteId,customPermissions:[]},create:{email:"test-garage@carzone.bj",fullName:"Test Comptable Garage",role:"COMPTA_GARAGE",active:true,passwordHash:direction.passwordHash,siteId:direction.siteId,customPermissions:[]}});
 const brands=await p.vehicleBrand.findMany({where:{active:true},select:{name:true,sortOrder:true,models:{where:{active:true},select:{name:true},take:5}}});
 console.log(JSON.stringify({userId:u.id,brands:brands.slice(0,10)},null,1));
 await p.$disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});
