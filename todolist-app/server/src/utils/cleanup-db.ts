import db from '../config/database';

// Function to clean up todos and comments tables (keeping users table intact)
function cleanupDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('🧹 Cleaning up todos and comments tables...');
        
        // Delete all comments first (due to foreign key constraints)
        db.run('DELETE FROM comments', [], (err: Error | null) => {
            if (err) {
                console.error('❌ Error deleting comments:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Comments table cleared');
            
            // Then delete all todos
            db.run('DELETE FROM todos', [], (err: Error | null) => {
                if (err) {
                    console.error('❌ Error deleting todos:', err.message);
                    reject(err);
                    return;
                }
                
                console.log('✅ Todos table cleared');
                console.log('🎉 Database cleanup completed successfully!');
                resolve();
            });
        });
    });
}

// Run cleanup if called directly
if (require.main === module) {
    cleanupDatabase()
        .then(() => {
            console.log('Closing database connection...');
            db.close((err: Error | null) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        })
        .catch((error: Error) => {
            console.error('Cleanup failed:', error.message);
            process.exit(1);
        });
}

export { cleanupDatabase };
