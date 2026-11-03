const {PrismaClient}=require("@prisma/client");const p=new PrismaClient();
(async()=>{
 const direction=await p.user.findUniqueOrThrow({where:{email:"direction@topcarzone.com"}});
 const user=await p.user.upsert({where:{email:"test-rental@carzone.bj"},update:{role:"GESTIONNAIRE_LOCATION",active:true,passwordHash:direction.passwordHash,siteId:direction.siteId,customPermissions:[]},create:{email:"test-rental@carzone.bj",fullName:"Test Gestionnaire Location",role:"GESTIONNAIRE_LOCATION",active:true,passwordHash:direction.passwordHash,siteId:direction.siteId,customPermissions:[]}});
 let vehicle=await p.vehicle.findFirst({where:{brand:"TEST-RENTAL"}});
 if(!vehicle) vehicle=await p.vehicle.create({data:{brand:"TEST-RENTAL",model:"Vehicule Location Test",year:2026,energy:"ESSENCE",priceXof:1000000,status:"EN_STOCK",fleetType:"RENTAL",rentalStatus:"DISPONIBLE",siteId:direction.siteId}});
 const customer=await p.customer.findFirst({where:{active:true}});
 console.log(JSON.stringify({userId:user.id,vehicleId:vehicle.id,customerId:customer?.id,customerName:customer?.contactName}));
 await p.$disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});
