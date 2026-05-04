import Admin from "../models/Admin.js";

export const seedSuperAdmin = async () => {
    const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@envalis.com";
    const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@2024!";
    
    let admin = await Admin.findOne({ email });
    
    if (admin) {
        // Sync password and info if already exists
        admin.password = password;
        admin.firstName = process.env.SUPER_ADMIN_FIRST_NAME || admin.firstName;
        admin.lastName = process.env.SUPER_ADMIN_LAST_NAME || admin.lastName;
        admin.role = "super_admin";
        admin.isSuperAdmin = true;
        admin.isActive = true;
        await admin.save();
        console.log(`✅ Super Admin password synced for: ${admin.email}`);
        return;
    }

    const superAdmin = new Admin({
        firstName: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
        lastName: process.env.SUPER_ADMIN_LAST_NAME || "Admin",
        email,
        password,
        role: "super_admin",
        isSuperAdmin: true,
        isActive: true,
    });
    superAdmin.setDefaultPermissions();
    await superAdmin.save();
    console.log(`🌱 Super Admin created: ${superAdmin.email}`);
};

// Standalone: node src/seed/seedSuperAdmin.js
if (process.argv[1].includes("seedSuperAdmin")) {
    const { connectDB } = await import("../config/db.js");
    await connectDB();
    await seedSuperAdmin();
    process.exit(0);
}
