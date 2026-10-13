<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class BackupDatabase extends Command
{
    protected $signature = 'db:backup {--keep=14 : Number of days of backups to keep}';

    protected $description = 'Dump the MySQL database to storage/app/backups as a gzipped SQL file';

    public function handle(): int
    {
        $db = config('database.connections.mysql');
        $dir = storage_path('app/backups');
        if (!is_dir($dir)) mkdir($dir, 0750, true);
        $file = $dir . '/' . $db['database'] . '-' . now()->format('Y-m-d_His') . '.sql.gz';

        $cmd = 'mysqldump --single-transaction --quick --routines'
            . ' -h ' . escapeshellarg($db['host']) . ' -P ' . escapeshellarg((string) $db['port'])
            . ' -u ' . escapeshellarg($db['username']) . ' ' . escapeshellarg($db['database'])
            . ' | gzip > ' . escapeshellarg($file);
        $process = Process::fromShellCommandline('bash -o pipefail -c ' . escapeshellarg($cmd), null, ['MYSQL_PWD' => (string) $db['password']]);
        $process->setTimeout(600)->run();

        if (!$process->isSuccessful()) {
            @unlink($file);
            $this->error('Backup failed: ' . trim($process->getErrorOutput()));
            return self::FAILURE;
        }

        $cutoff = now()->subDays((int) $this->option('keep'))->getTimestamp();
        foreach (glob($dir . '/*.sql.gz') as $old) {
            if (filemtime($old) < $cutoff) unlink($old);
        }

        $this->info('Backup written: ' . $file . ' (' . round(filesize($file) / 1024) . ' KB)');
        return self::SUCCESS;
    }
}
